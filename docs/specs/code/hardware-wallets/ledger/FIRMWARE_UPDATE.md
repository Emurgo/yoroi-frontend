#### Install python-dev (python 2.7) and pip<br/>
`sudo apt install python-dev`<br/>
`sudo apt install python-pip`


#### Install [Python tools for Ledger Blue and Nano S](https://github.com/LedgerHQ/blue-loader-python)<br/>
`pip uninstall ledgerblue`<br/>
`pip install ledgerblue`<br/>
`sudo apt-get install libudev-dev libusb-1.0-0-dev`<br/>
udev rules setup: [download and run](https://github.com/LedgerHQ/udev-rules/blob/master/add_udev_rules.sh)
`wget -q -O - https://raw.githubusercontent.com/LedgerHQ/udev-rules/master/add_udev_rules.sh | sudo bash`

#### Ledger's target ID
```
+-----------------+------------+
|    FirmWare     | Target ID  |
+-----------------+------------+
| Nano S <= 1.3.1 | 0x31100002 |
| Nano S 1.4.x    | 0x31100003 |
| Nano S 1.5.x    | 0x31100004 |
|                 |            |
| Blue 2.0.x      | 0x31000002 |
| Blue 2.1.x      | 0x31000004 |
|                 |            |
| MCU,any version | 0x01000001 |
+-----------------+------------+
```

#### FIRMWARE update<br/>
CURRENT_FIRMWARE_VERSION(aka Secure Element) = 1.4.2<br/>
CURRENT_MCU_VERSION = 1.6<br/>

UPDATE_TO_FIRMWARE_VERSION = 1.5.5<br/>
UPDATE_TO_MCU_VERSION = 1.7<br/>

DEVICE_TARGET_ID = 0x31100003 (if CURRENT_FIRMWARE_VERSION < 1.5.x ) other wise 0x31100004<br/>

**Reboot the ledger device in recovery mode by pressing right button when starting(unlock with pin if prompted)**<br/>
**SYNTAX**:<br/> 
python -m ledgerblue.updateFirmware<br/>
--target DEVICE_TARGET_ID<br/>
--url https://hsmprod.hardwarewallet.com/hsm/process<br/>
--perso perso_11<br/>
--firmware nanos/UPDATE_TO_FIRMWARE_VERSION/fw_CURRENT_FIRMWARE_VERSION/upgrade_osu_UPDATE_TO_FIRMWARE_VERSION<br/>
--firmwareKey nanos/UPDATE_TO_FIRMWARE_VERSION/fw_CURRENT_FIRMWARE_VERSION/upgrade_osu_UPDATE_TO_FIRMWARE_VERSION_key<br/>
run:<br/>
`python -m ledgerblue.updateFirmware --target 0x31100003 --url https://hsmprod.hardwarewallet.com/hsm/process --perso perso_11 --firmware nanos/1.5.5/fw_1.4.2/upgrade_osu_1.5.5 --firmwareKey nanos/1.5.5/fw_1.4.2/upgrade_osu_1.5.5_key`<br/>
and:<br/>
`python -m ledgerblue.updateFirmware --target 0x31100004 --url https://hsmprod.hardwarewallet.com/hsm/process --perso perso_11 --firmware nanos/1.5.5/fw_1.4.2/upgrade_1.5.5 --firmwareKey nanos/1.5.5/fw_1.4.2/upgrade_1.5.5_key`<br/>

Device will eventually display "Follow device repair instructions", then you should proceed with the following:<br/>

**ONLY AFTER SUCCESS OF PREVIOUS STEPS, ONLY IF YOU'RE UPDATING FROM A FIRMWARE < 1.5.3:**<br/>
Reboot device in bootloader mode by pressing left button when starting<br/>
Download and unzip the MCU firmware and bootloader updater from link below and run:<br/>
https://drive.google.com/file/d/1hyvdFhBA6FRCHOTuPB1O14q9Q3wnsER0/view?usp=sharing<br/>
`python -m ledgerblue.loadMCU --targetId 0x01000001 --fileName blup_0.9_misc_m1.hex --nocrc`<br/>
`python -m ledgerblue.loadMCU --targetId 0x01000001 --fileName mcu_1.7_over_0.9.hex --nocrc`<br/>

#### NEW SDK to compile apps<br/>
https://drive.google.com/file/d/1VKwl5LI1Qc0zF2Z2FELFIOakUkTLFYm4/view?usp=sharing
