const validateRegData = (data) => {
  console.log('validateRegData');
  const validData = {};
  for (let key in data) {
    switch (key) {
      case "email" : 
        if (typeof(data[key]) === 'string' 
        && data[key].match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)
        ) {
          validData.email = data[key].toLowerCase().trim();
        } else {
          validData.email = "";
        }
        break;
      case 'password' :
        if (typeof(data[key]) === 'string' 
        && data[key].length >= 6
        ) {
          validData.password = data[key];
        } else {
          validData.password = "";
        }
        break;
      case 'gender' :
        if (typeof(data[key]) === 'string' 
        && (data[key] === '' || data[key] === 'male' || data[key] === 'female')
        ) {
          validData.gender = data[key];
        } else {
          validData.gender = "";
        }
        break;
      case 'first_name' :
        if (typeof(data[key]) === 'string' 
        && data[key].trim().length >= 2
        ) {
          validData.first_name = data[key].trim();
        } else {
          validData.first_name = "";
        }
        break;
      case 'family_name' :
        if (typeof(data[key]) === 'string') {
          validData.family_name = data[key].trim();
        } else {
          validData.family_name = "";
        }
        break;
      default : validData[key] = "";
    }
  }

  return validData;
}

module.exports = validateRegData;