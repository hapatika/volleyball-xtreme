const Auth = (function(){

  let user = null

  const getUser = function(){
    return user;
  };
  
  const signin = function(username, password, onSuccess, onError) {
    const userData = { username, password };

    fetch("/signin", {
      method: "POST", 
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(userData)
    })
    .then((res) => {
      return res.json();
    })
    .then((json) => { // You use json here because it's a catch of the promise aboce, which returns the object that you're reading as json in the param. 
      if (json.status == "error") {
        if (onError){
          console.log("error in sign in")
          onError(json.error);
        }
      }
      else if (json.status = "success"){
        if(onSuccess){
          user = json.user;
          onSuccess(); // Is this the right way to call it?
        }
      }
    })
    // If you need a catch in the fetch request, add it here. 

    return { signin };
  }

  // this is for validating the user signed in at a time?
  const validate = function(onSuccess, onError) { // This is not triggered by the front end because FE has nothing to do with it. 
    fetch("/validate", {
      method:"GET", 
      headers:  { "Content-type": "application/json"}
    })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      if (json.status == "success"){
        if (onSuccess){
            user = json.user;
            onSuccess(user);}
      }
      else if (json.status == "error") {
        if (onError){
            onError(json.error);}
      }
    })
    return { validate };
  };

  const signout = function(onSuccess, onError) {

    fetch("/signout", {
        method: "GET", 
        headers: {"Content-type" : "application/json"}
    })
    .then((res) => {
        return res.json();
    })
    .then((json) => {
        if (json.status == "success"){
            onSuccess();
        }
        else {
            onError();
        }
    })
    .catch((err)=> {
      console.log("Error:", err)
    })
  };

  return { getUser, signin, validate, signout };

})();