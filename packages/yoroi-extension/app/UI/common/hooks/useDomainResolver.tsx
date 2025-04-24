import { useEffect, useState } from 'react';
import { isResolvableDomain, resolverApiMaker } from '@yoroi/resolver';
import { Api, Resolver } from '@yoroi/types';
import { useStrings } from './useStrings';
import { RustModule } from '../../../api/ada/lib/cardanoCrypto/rustLoader';

let resolverApiPromise: Promise<ReturnType<typeof resolverApiMaker>> | null = null;

const getInitializedResolverApi = async () => {
  if (resolverApiPromise) return resolverApiPromise;

  resolverApiPromise = Promise.resolve(
    resolverApiMaker({
      apiConfig: {
        [Resolver.NameServer.Unstoppable]: {
          apiKey: 'czsajliz-wxgu6tujd1zqq7hey_pclfqhdjsqolsxjfsurgh',
        },
      },
      cslFactory: ctx => {
        RustModule.CrossCsl.init(ctx);
        return RustModule.CrossCsl;
      },
    })
  );

  return resolverApiPromise;
};

type DomainResolverResponse = {
  nameServer: string;
  address: string | null;
  error: 'forbidden' | 'unexpected' | null;
};

const resolveAddressDomainNameServerName = (nameServerTag: string, strings: any): string => {
  switch (nameServerTag) {
    case Resolver.NameServer.Handle:
      return strings.adaHandle;
    case Resolver.NameServer.Cns:
      return strings.cardanoCNS;
    case Resolver.NameServer.Unstoppable:
      return strings.unstoppableDomains;
    default:
      return nameServerTag;
  }
};

export const useDomainResolver = (handle: string) => {
  const strings = useStrings();

  const [loading, setLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvedNameServer, setResolvedNameServer] = useState<string | null>(null);
  const [domainResolverMessage, setDomainResolverMessage] = useState<string | null>(null);

  const normalizedHandle = handle.trim().toLowerCase();
  const isDomainResolvable = isResolvableDomain(normalizedHandle);

  useEffect(() => {
    const resolve = async () => {
      setLoading(true);
      setResolvedAddress(null);
      setResolvedNameServer(null);
      setDomainResolverMessage(null);

      try {
        if (!isResolvableDomain(normalizedHandle)) {
          return;
        }

        const resolverApi = await getInitializedResolverApi();
        const { getCardanoAddresses } = resolverApi;

        if (!getCardanoAddresses) throw new Error('Resolver API is not available');

        const results = await getCardanoAddresses({ resolve: normalizedHandle });

        let fallback: DomainResolverResponse | null = null;

        for (const { nameServer, address, error } of results) {
          const resolvedNameServer = nameServer ? resolveAddressDomainNameServerName(nameServer, strings) : 'Unknown';

          if (address) {
            setResolvedAddress(address);
            setResolvedNameServer(resolvedNameServer);
            setDomainResolverMessage(null);
            return;
          }

          if (error?.name === 'InvalidDomain') {
            setDomainResolverMessage(strings.receiverFieldLabelUnresolvedAddress);
            return;
          }

          if (error instanceof Api.Errors.Forbidden && !fallback) {
            fallback = { nameServer: resolvedNameServer, address: null, error: 'forbidden' };
          } else if (!fallback) {
            fallback = { nameServer: resolvedNameServer, address: null, error: 'unexpected' };
          }
        }

        if (fallback) {
          setDomainResolverMessage(
            `${fallback.nameServer}: ${
              fallback.error === 'forbidden'
                ? strings.receiverFieldLabelForbiddenAccess
                : strings.receiverFieldLabelUnexpectedError
            }`
          );
        } else {
          setDomainResolverMessage(strings.receiverFieldLabelUnresolvedAddress);
        }
      } catch (err) {
        console.error(`Domain resolution failed for "${normalizedHandle}":`, err);
        setDomainResolverMessage(strings.receiverFieldLabelUnexpectedError);
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [normalizedHandle, strings]);

  return {
    isDomainResolvable,
    domainResolverMessage,
    resolvedAddress,
    resolvedNameServer,
    loading,
  };
};
