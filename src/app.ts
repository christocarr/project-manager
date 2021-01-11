interface Validatable {
	value: string | number;
	isRequired?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(validatableInput: Validatable) {
	let isValid = true;

	if (validatableInput.isRequired) {
		isValid = isValid && validatableInput.value.toString().trim().length !== 0;
	}
	if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
		isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
	}
	if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
		isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
	}
	if (validatableInput.min != null && typeof validatableInput.value === 'number') {
		isValid = isValid && validatableInput.value >= validatableInput.min;
	}
	if (validatableInput.max != null && typeof validatableInput.value === 'number') {
		isValid = isValid && validatableInput.value <= validatableInput.max;
	}
	return isValid;
}

class ProjectInput {
	formTemplate: HTMLTemplateElement;
	wrapperDiv: HTMLDivElement;
	formElement: HTMLFormElement;
	titleInput: HTMLInputElement;
	descriptionInput: HTMLInputElement;
	peopleInput: HTMLInputElement;
	constructor() {
		this.formTemplate = document.getElementById('project-input')! as HTMLTemplateElement;
		this.wrapperDiv = document.getElementById('app')! as HTMLDivElement;

		const importedFormElement = document.importNode(this.formTemplate.content, true);
		this.formElement = importedFormElement.firstElementChild as HTMLFormElement;
		this.formElement.id = 'user-input';

		this.titleInput = this.formElement.querySelector('#title') as HTMLInputElement;
		this.descriptionInput = this.formElement.querySelector('#description') as HTMLInputElement;
		this.peopleInput = this.formElement.querySelector('#people') as HTMLInputElement;

		this.configure();
		this.insertForm();
	}

	private getUserInput(): [string, string, number] | void {
		const title = this.titleInput.value;
		const description = this.descriptionInput.value;
		const people = this.peopleInput.value;

		const titleValidatable: Validatable = {
			value: title,
			isRequired: true,
			minLength: 5,
			maxLength: 10,
		};

		const descValidatable: Validatable = {
			value: description,
			isRequired: true,
			minLength: 10,
			maxLength: 100,
		};

		const peopleValidatable: Validatable = {
			value: people,
			isRequired: true,
			min: 1,
			maxLength: 5,
		};

		if (!validate(titleValidatable) && !validate(descValidatable) && !validate(peopleValidatable)) {
			alert('Inputs cannot be empty');
			return;
		} else {
			this.clearInputs();
			return [title, description, Number(people)];
		}
	}

	private clearInputs() {
		this.titleInput.value = '';
		this.descriptionInput.value = '';
		this.peopleInput.value = '';
	}

	private handleFormSubmit(ev: Event) {
		ev.preventDefault();
		const userInput = this.getUserInput();
		if (Array.isArray(userInput)) {
			const [title, description, people] = userInput;
			console.log(title, description, people);
		}
	}

	private configure() {
		this.formElement.addEventListener('submit', this.handleFormSubmit.bind(this));
	}

	private insertForm() {
		this.wrapperDiv.insertAdjacentElement('afterbegin', this.formElement);
	}
}

class ProjectList {
	projectTemplate: HTMLTemplateElement;
	sectionElement: HTMLElement;
	wrapperDiv: HTMLDivElement;
	constructor(private type: 'active' | 'finished') {
		this.projectTemplate = document.getElementById('project-list')! as HTMLTemplateElement;
		this.wrapperDiv = document.getElementById('app')! as HTMLDivElement;

		const importedNode = document.importNode(this.projectTemplate.content, true);
		this.sectionElement = importedNode.firstElementChild as HTMLElement;
		this.sectionElement.id = `${this.type}-projects`;
		this.insertProjectList();
		this.renderContent();
	}

	private renderContent() {
		const listId = `${this.type}-project-list`;
		this.sectionElement.querySelector('ul')!.id = listId;
		this.sectionElement.querySelector('h2')!.innerText = this.type.toUpperCase() + ' PROJECTS';
	}

	private insertProjectList() {
		this.wrapperDiv.insertAdjacentElement('beforeend', this.sectionElement);
	}
}
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
