export const handleTransaction = async (txPromise, toast, successMsg = 'Transaction successful!') => {
  let toastId = 'tx-loading';
  try {
    const tx = await txPromise;
    toastId = tx.hash;
    toast.loading('Waiting for transaction confirmation...', { id: toastId });
    
    const receipt = await tx.wait();
    if (receipt.status === 0) throw new Error('Transaction reverted on-chain.');
    
    toast.success(successMsg, { id: toastId });
    return true;
  } catch (error) {
    console.error('Transaction failed:', error);
    
    let errorMsg = 'Transaction failed. ';
    
    // Ethers v6 error handling
    if (error.code === 'ACTION_REJECTED') {
      errorMsg = 'Transaction rejected by user.';
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMsg = 'Insufficient ETH for gas.';
    } else if (error.code === 'CALL_EXCEPTION') {
      errorMsg = error.reason ? `Reverted: ${error.reason}` : 'Smart contract call failed.';
    } else if (error.shortMessage) {
      errorMsg = error.shortMessage;
    } else {
      errorMsg += error.message.split(' (')[0];
    }

    toast.error(errorMsg, { id: toastId === 'tx-loading' ? 'tx-error' : toastId });
    return false;
  }
};
