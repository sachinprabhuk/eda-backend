export const addFaculty = async (axios, facid) => {
	return await axios.post('/admin/faculty', {
		faculty: {
			id: facid,
			name: "sachin",
			password: facid,
			branch: "CSE",
			designation: 1,
			email: "prabhachin44@gmail.com",
			contact: "8277487857"
		}
	})
}

export const addSlot = async (axios, date: Date, slotType: string) => {
	return await axios.post('/admin/slot', {
		slot: {
			type: slotType, total: 10, date: date.toISOString()
		}
	});
}

export const slotSelection = async (axios, username: string, slotID: string) => {
	return await axios.post('/faculty/select-slot', {
		user: {
			admin: false,
			username
		},
		slotID,
	});
}