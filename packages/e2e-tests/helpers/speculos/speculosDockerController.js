import Docker from 'dockerode';
import { LedgerModels } from '../ledgerHelper.js';
import { fiveSeconds, halfSecond } from '../timeConstants.js';
import { sleep } from '../../utils/utils.js';

class SpeculosDockerControllerError extends Error {}

export class SpeculosDockerController {
  constructor(logger, model, seedPhrase) {
    this.logger = logger;
    this.model = model;
    this.seedPhrase = seedPhrase;
    this.docker = new Docker();
    this.containerId = '';
  }

  getContainerOptions = (model, seedPhrase, appFile) => {
    return {
      Image: 'ghcr.io/ledgerhq/speculos:5d508ef13706c302604c0d44c09374cc4117bb23',
      ExposedPorts: {
        '5001/tcp': {},
      },
      HostConfig: {
        AutoRemove: true,
        // the path like this because tests are run from the directory e2e-tests
        Binds: [`${process.cwd()}/helpers/speculos/apps:/speculos/apps`],
        PortBindings: {
          '5001/tcp': [
            {
              HostIp: '0.0.0.0',
              HostPort: '5001',
            },
          ],
        },
      },
      Cmd: [
        '--display',
        'headless',
        '--api-port',
        '5001',
        '--model',
        model,
        '--seed',
        seedPhrase,
        appFile,
      ],
    };
  };

  getAppFile(model) {
    switch (model) {
      case LedgerModels.NanoS:
        return 'apps/nanosApp.elf';
      case LedgerModels.NanoX:
        return 'apps/nanoxApp.elf';
      default:
        return 'apps/nanospApp.elf';
    }
  }

  async runContainer() {
    try {
      this.logger.info(`runContainer: Ledger model: ${this.model}`);
      this.logger.info(`runContainer: Ledger seed phrase: "${this.seedPhrase}"`);
      const container = await this.docker.createContainer(
        this.getContainerOptions(this.model, this.seedPhrase, this.getAppFile(this.model))
      );
      await container.start();
      this.logger.info(`runContainer: Container run with ID: ${container.id}`);
      this.containerId = container.id;
      const endTime = Date.now() + fiveSeconds;
      while (!this.isContainerRunning()) {
        if (Date.now() > endTime) {
          throw new Error('The container is not ready after 5 seconds');
        }
        await sleep(halfSecond);
      }
    } catch (error) {
      this.logger.error('Error while running the container:', error);
      throw new SpeculosDockerControllerError(error.message);
    }
  }
  async stopContainer() {
    if (!this.containerId) {
      this.logger.error('stopContainer: No container to stop');
      throw new SpeculosDockerControllerError('No container to stop');
    }
    try {
      this.logger.info(`stopContainer: Stoping container with Id: ${this.containerId}`);
      const container = await this.docker.getContainer(this.containerId);
      await container.stop();
      this.logger.info(`stopContainer: Container is stopped`);
      this.containerId = '';
    } catch (error) {
      console.log(error);
      this.logger.error('Error occurred when trying to stop the container');
      throw new SpeculosDockerControllerError(error.message);
    }
  }

  async isContainerRunning() {
    if (!this.containerId) return false;
    try {
      const container = this.docker.getContainer(this.containerId);
      const data = await container.inspect();
      return data.State.Running;
    } catch (error) {
      return false;
    }
  }

  async getContainerLogs() {
    if (!this.containerId) return '';
    const container = this.docker.getContainer(this.containerId);
    const logs = await container.logs({ stdout: true, stderr: true });
    return logs.toString();
  }
}
