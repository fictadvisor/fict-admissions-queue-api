export const pick = <T>(obj: T, keys: (keyof T)[], nullable: boolean = true) => {
  const temp: Partial<T> = {};
  
  for (let key of keys) {
    if (key in obj) {
      temp[key] = obj[key];
    } else if (nullable) {
      temp[key] = null;
    }
  }

  return temp;
};
