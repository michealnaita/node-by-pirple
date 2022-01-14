/**
 * These are request handlers for the application
 */
const reqToken = null;
const handlers = {};

/**
 * @description handles the signin request
 */
handlers.signIn = async (form) => {
  const payload = helpers.getFormData(form);

  // sanitise inputs
  payload.phone = payload.phone.toString();
  if (payload.phone.length > 10 && payload.phone[0] !== '0')
    payload.phone = payload.phone.replace(/^256/, '0');
  payload.phone = payload.phone.replace(/[\(\)-\s]/, '');

  // Validate form data
  const isValid = helpers.validate(['phone', payload.phone]);

  if (!isValid) {
    helpers.alertUser({
      message: isValid.message,
      type: 'error',
    });
    return;
  }
  const headers = new Headers();
  headers.append('content-type', 'application/json');
  try {
    const res = await fetch('/api/tokens', {
      headers,
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log(res.statusCode);
  } catch (e) {
    console.log(e);
  }
};

/**
 * @description handles the sign up request
 */
handlers.signUp = async (form) => {
  /**
   * {
   *  firstname:string;
   *  lastname:string;
   *  password:string;
   *  phone:string;
   * tosAgreement:boolean;
   * }
   */
  const payload = helpers.getFormData(form);

  // sanitise inputs
  payload.phone = payload.phone.toString();
  if (payload.phone.length > 10 && payload.phone[0] !== '0')
    payload.phone = payload.phone.replace(/^256/, '0');
  payload.phone = payload.phone.replace(/[\(\)-\s]/, '');
  payload.firstname = payload.firstname.trim();
  payload.lastname = payload.lastname.trim();
  payload.tosAgreement = payload.tosAgreement ? true : false;

  // Validate form data
  const isValid = helpers.validate(payload);
  console.log(isValid);
  if (!isValid) {
    helpers.alertUser({
      message: isValid.message,
      type: 'error',
    });
    return;
  }
  const headers = new Headers();
  headers.append('content-type', 'application/json');
  console.log(payload);
  try {
    const res = await fetch('/api/users/', {
      headers,
      method: 'POST',
      body: JSON.stringify(payload),
    });
    console.log(res.statusCode);
  } catch (e) {
    console.log(e);
  }
};
handlers.extendToken = () => {
  //
};
