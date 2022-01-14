const helpers = {};
helpers.validate = (fields) => {
  let error = false;
  Object.keys(fields).forEach((field) => {
    const value = fields[field];
    if (field == 'phone')
      if (value.length != 10) {
        error = { field, message: 'Please use a valid Phone Number' };
      }
    if (['firstname', 'lastname'].includes(field))
      if (value.length < 3 || value.match(/[^a-zA-Z]/)) {
        error = { field, message: 'Please use a valid name' };
      }
    if (field == 'password')
      if (value.length < 3) {
        error = { field, message: 'Please use a stronger password' };
      }
  });
  return error ? error : true;
};

// TODO: impletment the alert user action
helpers.alertUser = ({ message, type }) => {
  if (type == 'error') {
    // alertBanner.classList.add('');
    console.log('To user: ', message);
  }
};

helpers.getFormData = (form) => {
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);
  return payload;
};
