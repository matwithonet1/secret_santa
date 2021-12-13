const config = require('./config');
const list = require('./list_2021.json');

const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const run = async () => {
  const listCopy = JSON.parse(JSON.stringify(list));
  const listOfPairedIndices = [];

  for (let i = 0; i < list.length; i++) {
    let secondSanta = getValidIndex(listOfPairedIndices, i);
    listCopy[i].secret_santa = secondSanta;
    listOfPairedIndices.push(secondSanta);
    console.log(i, secondSanta);
  }

  for (let i = 0; i < listOfPairedIndices.length; i++) {
    const firstSanta = listCopy[i];
    const secondSanta = listCopy[listCopy[i].secret_santa];
    if (secondSanta.list.length > 1300) {
      const messages = secondSanta.list.match(/(.|[\r\n]){1,1300}/g);
      await client.messages.create({
        body: `HO HO HO ${listCopy[i].name}! Your secret santa this year is ${
          listCopy[listCopy[i].secret_santa].name
        } \nHere is their list: \n${messages[0]}`,
        from: '+18084950870',
        to: listCopy[i].number,
      });
      for (let k = 1; k < messages.length; k++) {
        await client.messages.create({
          body: `${messages[k]}`,
          from: '+18084950870',
          to: listCopy[i].number,
        });
      }
      console.log(
        'Sending chunked messages for',
        listCopy[i].name,
        listCopy[listCopy[i].secret_santa].name
      );
    } else {
      await client.messages.create({
        body: `HO HO HO ${listCopy[i].name}! Your secret santa this year is ${
          listCopy[listCopy[i].secret_santa].name
        } \nHere is their list: \n${listCopy[listCopy[i].secret_santa].list}`,
        from: '+18084950870',
        to: listCopy[i].number,
      });
      console.log(
        'Sending messages for',
        listCopy[i].name,
        listCopy[listCopy[i].secret_santa].name
      );
    }
  }
  // For running one-offs that for some reason dont get the text
  //   console.log(
  //     `This one is real HO HO HO ${listCopy[7].name}! Your secret santa this year is ${listCopy[4].name} \nHere is their list: \n${listCopy[4].list}`
  //   );
  //   await client.messages.create({
  //     body: `This one is real HO HO HO ${listCopy[7].name}! Your secret santa this year is ${listCopy[4].name} \nHere is their list: \n${listCopy[4].list}`,
  //     from: '+18084950870',
  //     to: listCopy[7].number,
  //   });
};

getValidIndex = (listOfPairedIndices, firstSanta) => {
  let secondSanta = Math.floor(Math.random() * Math.floor(list.length));
  while (
    listOfPairedIndices.indexOf(secondSanta) >= 0 ||
    isSpouse(firstSanta, secondSanta) ||
    firstSanta === secondSanta
  ) {
    secondSanta = Math.floor(Math.random() * Math.floor(list.length));
  }

  return secondSanta;
};

isSpouse = (firstSanta, secondSanta) => {
  if (firstSanta % 2 === 0 && firstSanta + 1 === secondSanta) {
    return true;
  }
  if (firstSanta % 2 === 1 && firstSanta - 1 === secondSanta) {
    return true;
  }
  return false;
};
run();
