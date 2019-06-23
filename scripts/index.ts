import axios from 'axios';

const baseURL = "http://localhost:3000/api";

const addFaculties = async () => {
	const fac1 = {
		"faculty": {
	    "id": "1111",
	    "name": "sachin",
	    "password": "1111",
	    "branch": "CSE",
	    "designation": 1,
	    "email": "prabhusachin44@gmail.com",
	    "contact": "8277487857"
		}
	}
	const fac2 = {
		"faculty": {
	    "id": "1112",
	    "name": "raiden",
	    "password": "1112",
	    "branch": "CSE",
	    "designation": 2,
	    "email": "raiden44@gmail.com",
	    "contact": "8266487857"
		}
	}
	const login = {
		admin: true, username: "sachin", password: "prabhu"
	}
	const axiosConfig = {
		headers: {
			authorization: await axios.post(`${baseURL}/auth/login`, login)
		}
	}
	return await Promise.all([
		axios.post(`${baseURL}/admin/faculty`, fac1, axiosConfig),
		axios.post(`${baseURL}/admin/faculty`, fac2, axiosConfig),
	]);
	
}

const slotSelection = async (facID: string, slots: string[]) => {
	const login = {
		admin: false, username: facID, password: facID
	}
	const axiosConfig = {
		headers: {
			authorization: (await axios.post(`${baseURL}/auth/login`, login)).data
		}
	}
	return await Promise.all(slots.map(slotID => {
		return axios.post(`${baseURL}/faculty/select-slot`, {slotID},axiosConfig);
	}))
}

// addFaculties()
// 	.then(data => console.log(data[0].data, data[1].data))
// 	.catch(console.log)

slotSelection('1112', [
	"689b8b2a-d19e-4e50-bc2c-e658caa036a5",
	"6401da0f-193e-429f-9615-328cde2de70a"
])
	.then(data => console.log(data[0].data, data[1].data))
	.catch(console.log);


// (async () => {
// 	try {
// 		const response = await axios.post("http://localhost:3000/api/auth/login", {
// 			username: "sachin",
// 			password: "prabh",
// 			admin: true
// 		});
// 		console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy");
// 		console.log(response.data);
// 	}catch(e) {
// 		console.log(e.response.data)
// 	}	
// })();

/////////////////// or /////////////////////////

// axios.post("http://localhost:3000/api/auth/login", {
// 	username: "sachin",
// 	password: "prabhu",
// 	admin: true
// })
// .then(response => console.log(response.data))
// .catch(e => console.log(e.response.data));

