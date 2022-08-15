export const getErrorMessage = (err: any) => {
  const message = err?.response?.data?.message || err.message;

  if (message.includes("clash_shift_constraint")) {
    return "Cannot create/update shift that clashes with another shift";
  }

  return message;
};
