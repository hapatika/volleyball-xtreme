const Registration = (function() {

  const register = function (username, name, password, onSuccess, onError){
    console.log("register in registration.js?");
    const user_data = { username, name, password };

    fetch("/register", {
      method: "POST",
      headers: { "Content-type": "application/json"},
      body: JSON.stringify(user_data)
    })
    .then((res) => { // res exists after the fetch method is run successfully
      return res.json(); // you have to return this because otherwise the res object does not exist in this scope
    })
    .then((json) =>{ // json exists exists after the then res method is run successfully 
      if (json.status == "error"){
          if (onError) {
              onError(json.error)
          }
      }
      else if (json.status == "success"){
          if (onSuccess) {
              onSuccess();
          }
      }
    })
  };

  return { register };
})();