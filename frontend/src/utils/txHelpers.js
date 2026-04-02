export const handleTransaction = async (txPromise, toast, successMsg = 'Transaction successful!') => {
  try {
    const tx = await txPromise;
    toast.loading('Waiting for transaction confirmation...', { id: tx.hash });
    await tx.wait();
    toast.success(successMsg, { id: tx.hash });
    return true;
  } catch (error) {
    console.error('Transaction failed:', error);
    let errorMsg = 'Transaction failed. ';
    // Handle typical revert reasons
    if (error.reason) {
      errorMsg += error.reason;
    } else if (error.data && error.data.message) {
      errorMsg += error.data.message;
    } else if (error.message) {
      const match = error.message.match(/execution reverted: (.*?)"/);
      if (match) errorMsg += match[1];
      else errorMsg += error.message.split('(')[0];
    }
    toast.error(errorMsg, { id: error.hash || 'error' });
    return false;
  }
};
