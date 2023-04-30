export function compareObjects(oldObj, newObj) {
  let oldData = '';
  let newData = '';

  for (const key in oldObj) {
    if (newObj.hasOwnProperty(key)) {
      if (oldObj[key] !== newObj[key]) {
        oldData += `<div>${key}: ${oldObj[key]}</div>`;
        newData += `<div>${key}: ${newObj[key]}</div>`;
      }
    }
  }

  for (const key in newObj) {
    if (!oldObj.hasOwnProperty(key) && key !== 'transactionHash') {
      newData += `<div>${key}: ${newObj[key]}</div>`;
    }
  }

  return { oldData, newData };
}
