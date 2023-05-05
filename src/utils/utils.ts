const keyMap = {
  farmedFishContract: 'Farmed fish contract',
  fishSeedId: 'Fish seed ID',
  speciesName: 'Species name',
  numberOfFishSeedsAvailable: 'Quantity available',
  waterTemperature: 'Water temperature in fish farming environment',
  methodOfReproduction: 'Method of reproduction',
  geographicOrigin: 'Geographic origin',
  image: 'Image',
  IPFSHash: 'IPFS hash',
  owner: 'Owner',
};

export const handleMapGeographicOrigin = (geographicOrigin: number) => {
  switch (geographicOrigin) {
    case 0:
      return 'Brackish';
    case 1:
      return 'Fresh';
    case 2:
      return 'Marine';
    default:
      return 'Not Found';
  }
};

export const handleMapMethodOfReproduction = (methodOfReproduction: number) => {
  switch (methodOfReproduction) {
    case 0:
      return 'Natural';
    case 1:
      return 'Artifical';
    default:
      return 'Not Found';
  }
};

export function compareObjects(oldObj, newObj) {
  let oldData = '';
  let newData = '';

  for (const key in oldObj) {
    if (newObj.hasOwnProperty(key)) {
      if (oldObj[key] !== newObj[key]) {
        if (key === 'geographicOrigin') {
          oldData += `<div>${keyMap[key]}: ${handleMapGeographicOrigin(
            oldObj[key],
          )}</div>`;
          newData += `<div>${keyMap[key]}: ${handleMapGeographicOrigin(
            newObj[key],
          )}</div>`;
        } else if (key === 'methodOfReproduction') {
          oldData += `<div>${keyMap[key]}: ${handleMapMethodOfReproduction(
            oldObj[key],
          )}</div>`;
          newData += `<div>${keyMap[key]}: ${handleMapMethodOfReproduction(
            newObj[key],
          )}</div>`;
        } else {
          oldData += `<div>${keyMap[key]}: ${oldObj[key]}</div>`;
          newData += `<div>${keyMap[key]}: ${newObj[key]}</div>`;
        }
      }
    }
  }

  for (const key in newObj) {
    if (!oldObj.hasOwnProperty(key) && key !== 'transactionHash') {
      if (key === 'geographicOrigin') {
        oldData += `<div>${keyMap[key]}: ${handleMapGeographicOrigin(
          oldObj[key],
        )}</div>`;
        newData += `<div>${keyMap[key]}: ${handleMapGeographicOrigin(
          newObj[key],
        )}</div>`;
      } else if (key === 'methodOfReproduction') {
        oldData += `<div>${keyMap[key]}: ${handleMapMethodOfReproduction(
          oldObj[key],
        )}</div>`;
        newData += `<div>${keyMap[key]}: ${handleMapMethodOfReproduction(
          newObj[key],
        )}</div>`;
      } else {
        newData += `<div>${keyMap[key]}: ${newObj[key]}</div>`;
      }
    }
  }

  return { oldData, newData };
}
