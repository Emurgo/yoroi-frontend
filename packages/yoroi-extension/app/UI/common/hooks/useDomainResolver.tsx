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

const resolveAddressDomainNameServerName = (nameServerTag: string): string => {
  switch (nameServerTag) {
    case Resolver.NameServer.Handle:
      return 'ADA Handle';
    case Resolver.NameServer.Cns:
      return 'Cardano Name Service (CNS)';
    case Resolver.NameServer.Unstoppable:
      return 'Unstoppable Domains';
    default:
      return nameServerTag;
  }
};

export const useDomainResolver = (handle: string) => {
  const strings = useStrings();

  const isDomainResolvable = isResolvableDomain(handle);

  const [loading, setLoading] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [resolvedNameServer, setResolvedNameServer] = useState<string | null>(null);
  const [domainResolverMessage, setDomainResolverMessage] = useState<string | null>(null);

  useEffect(() => {
    const resolve = async () => {
      if (!isDomainResolvable) {
        setResolvedAddress(null);
        setResolvedNameServer(null);
        setDomainResolverMessage(null);
        return;
      }

      setLoading(true);

      try {
        const resolverApi = await getInitializedResolverApi();
        const { getCardanoAddresses } = resolverApi;

        if (!getCardanoAddresses) throw new Error('Resolver API is not available');

        const results = await getCardanoAddresses({ resolve: handle });

        let fallback: DomainResolverResponse | null = null;

        for (const { nameServer, address, error } of results) {
          const resolvedNameServer = nameServer ? resolveAddressDomainNameServerName(nameServer) : 'Unknown';

          if (address) {
            setResolvedAddress(address);
            setResolvedNameServer(resolvedNameServer);
            setDomainResolverMessage(null);
            return;
          }

          if (error instanceof Api.Errors.Forbidden && !fallback) {
            fallback = { nameServer: resolvedNameServer, address: null, error: 'forbidden' };
          } else if (!fallback) {
            fallback = { nameServer: resolvedNameServer, address: null, error: 'unexpected' };
            console.error(`Domain resolve error: ${error?.constructor?.name}`, error);
          }
        }

        if (fallback) {
          setResolvedAddress(null);
          setResolvedNameServer(null);
          setDomainResolverMessage(
            `${fallback.nameServer}: ${
              fallback.error === 'forbidden'
                ? strings.receiverFieldLabelForbiddenAccess
                : strings.receiverFieldLabelUnexpectedError
            }`
          );
        } else {
          setResolvedAddress(null);
          setResolvedNameServer(null);
          setDomainResolverMessage(strings.receiverFieldLabelUnresolvedAddress);
        }
      } catch (err) {
        console.error('Domain resolution failed:', err);
        setResolvedAddress(null);
        setResolvedNameServer(null);
        setDomainResolverMessage(strings.receiverFieldLabelUnexpectedError);
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [handle, isDomainResolvable]);

  return {
    isDomainResolvable,
    domainResolverMessage,
    resolvedAddress,
    resolvedNameServer,
    loading,
  };
};
