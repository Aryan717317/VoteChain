export const handleTransaction = async (txPromise, toast, successMsg = 'Transaction successful!') => {
  let toastId = toast.loading('Please confirm transaction in your wallet...');
  try {
    const tx = await txPromise;
    toast.loading('Transaction submitted. Waiting for blockchain confirmation...', { id: toastId });
    
    const receipt = await tx.wait();
    if (receipt.status === 0) throw new Error('Transaction reverted on-chain.');
    
    toast.success(successMsg, { id: toastId });
    return true;
  } catch (error) {
    console.error('Transaction failed:', error);
    
    let errorMsg = 'Transaction failed. ';
    
    if (error && typeof error === 'object') {
      if (error.code === 'ACTION_REJECTED') {
        errorMsg = 'Transaction rejected by user.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMsg = 'Insufficient ETH for gas.';
      } else if (error.code === 'CALL_EXCEPTION') {
        errorMsg = error.reason ? `Reverted: ${error.reason}` : 'Smart contract call failed (Execution Reverted).';
      } else if (error.shortMessage) {
        errorMsg = error.shortMessage;
      } else if (error.info && error.info.error && error.info.error.message) {
        // Handle nested internal JSON-RPC errors
        errorMsg += error.info.error.message;
      } else if (error.message) {
        errorMsg += error.message.split(' (')[0];
      } else {
        errorMsg += 'Unknown error occurred.';
      }
    } else {
      errorMsg += String(error);
    }

    toast.error(errorMsg, { id: toastId === 'tx-loading' ? 'tx-error' : toastId });
    return false;
  }
};
