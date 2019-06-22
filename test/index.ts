import axios from 'axios';

(async () => {
	try {
		const response = await axios.post("http://localhost:3000/api/auth/login", {
			username: "sachin",
			password: "prabh",
			admin: true
		});
		console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
		console.log(response.data);
	}catch(e) {
		console.log(e.response.data)
	}	
})();

/////////////////// or /////////////////////////

axios.post("http://localhost:3000/api/auth/login", {
	username: "sachin",
	password: "prabhu",
	admin: true
})
.then(response => console.log(response.data))
.catch(e => console.log(e.response.data));

