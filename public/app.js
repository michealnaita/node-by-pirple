let appToken;
const form = document.querySelector('form');
const alertBanner = document.querySelector('alert-banner');

// get all form instances
// get the current form
// assign form handler
// make request to the api
// get response
// if no error do something
// if  error do otherthing

const helpers = {};
helpers.validate = (...fields) => {
  let error = false;
  fields.forEach((field) => {
    const [fieldName, value] = field;
    if (fieldName=='phone') 
        if (typeof value != 'string' && value.length != 10) error = true;
        break;
    
  });
  return !!error;
};
helpers.alertUser=({message,type})=>{
  if(type=='error'){
    alertBanner.classList.add('')
  }
}
form &&
  form.addEventListener('submit', async (e) => {
    const handler = {};

    // handle the sign up method
    handler.signUpForm = (payload) => {
      payload.tosAgreement = payload.tosAgreement ? true : false;
      try {
        console.log(payload);
      } catch (e) {
        console.log(e);
      }
    };

    // sign in method
    handler.signInForm = (payload) => {
      try {
        console.log(payload);
      } catch (e) {
        console.log(e);
      }
    };
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));

    switch (e.target.id) {
      case 'signin-form':
        handler.signInForm(data);
        break;
      case 'signup-form':
        handler.signUpForm(data);
        break;
      default:
        return;
    }
  });

/**
 * @param form - instance of a form that
 */
function signInhandler(form) {
  // Getform data
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData);

  // sanitise inputs
  payload.phone = payload.phone.toString();
  if (payload.phone.length == 10 && payload.phone[0] == '0')
    payload.phone = payload.phone.replace(/^0/, '256');
  payload.phone = payload.phone.replace(/[\(\)-\s]/, '');

  // Validate form data
  const isValid = helpers.validate(['phone', payload.phone]);

  if (isValid) {
    helpers.alertUser({
      message: '',
      type: 'error',
    });
    return;
  }
}
