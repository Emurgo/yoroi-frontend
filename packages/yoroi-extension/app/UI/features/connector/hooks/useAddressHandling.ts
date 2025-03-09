import { useCallback } from 'react';
import { truncateAddressShort } from '../../../../utils/formatters';

interface UseAddressHandlingProps {
  onCopyAddressTooltip: (address: string, message: string) => void;
  addressToDisplayString: (address: string) => string;
}

export const useAddressHandling = ({
  onCopyAddressTooltip,
  addressToDisplayString,
}: UseAddressHandlingProps) => {
  const formatAddress = useCallback((address: string) => {
    const displayAddress = addressToDisplayString(address);
    return truncateAddressShort(displayAddress, 10);
  }, [addressToDisplayString]);

  const handleCopyAddress = useCallback((address: string) => {
    navigator.clipboard.writeText(address);
    onCopyAddressTooltip(address, 'Address copied to clipboard');
  }, [onCopyAddressTooltip]);

  return {
    formatAddress,
    handleCopyAddress,
  };
}; 