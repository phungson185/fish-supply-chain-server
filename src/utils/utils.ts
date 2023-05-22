import moment from 'moment';

const keyMap = {
  title: 'Title',
  subTitle: 'Sub title',
  description: 'Description',
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
  fishWeight: 'Fish weight',
  totalNumberOfFish: 'Total number of fish',
  orderable: 'Orderable',
  quantity: 'Quantity',
  fishProcessorId: "Fish processor's ID",
  processedSpeciesName: 'Processed species name',
  registrationContract: 'Registration contract',
  fishProcessor: 'Fish processor',
  dateOfProcessing: 'Date of processing',
  dateOfExpiry: 'Date of expiry',
  farmedFishPurchaseOrderID: 'Farmed fish purchase order ID',
  filletsInPacket: 'Fillets in packet',
  numberOfPackets: 'Number of packets',
  processingContract: 'Processing contract',
  processedSpeciesname: 'Processed species name',
  listing: 'Listing',
};

export const noCompareKeys = [
  'farmedFishGrowthDetailsID',
  'farmedFishPurchaseOrderID',
  'transactionHash',
];

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
      if (['dateOfProcessing', 'dateOfExpiry'].includes(key)) {
        if (Number(oldObj[key]) !== Number(newObj[key])) {
          oldData += `<div>${keyMap[key]}: ${new Date(oldObj[key])}</div>`;
          newData += `<div>${keyMap[key]}: ${new Date(newObj[key])}</div>`;
        }
        continue;
      }

      if (oldObj[key] !== newObj[key] && !noCompareKeys.includes(key)) {
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
    if (!oldObj.hasOwnProperty(key) && !noCompareKeys.includes(key)) {
      if (['dateOfProcessing', 'dateOfExpiry'].includes(key)) {
        if (Number(oldObj[key]) !== Number(newObj[key])) {
          newData += `<div>${keyMap[key]}: ${new Date(newObj[key])}</div>`;
        }
        continue;
      }

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
