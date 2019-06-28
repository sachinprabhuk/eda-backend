import { Slot } from "src/entities/Slot.entity";

export class slotsResp {
	id: string
	date: Date
	total: number
	remaining: number
}


export class SlotSelectionError {
	message: string
	data: any
	constructor(message: string, data: any) {
		this.message = message;
		this.data = data;
	}
}

export class SlotSelectionResp {
	errors: Array<SlotSelectionError>
	allotedSlots: Slot[]
	
	constructor() {
		this.errors = [];
		this.allotedSlots = [];
	}

	updateResp(data: SlotSelectionError | Slot) {
		if(!data) return;
		if(data instanceof SlotSelectionError)
			this.errors.push(data);
		else
			this.allotedSlots.push(data);
	}
}