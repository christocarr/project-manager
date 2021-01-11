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

		if (
			title.trim().length === 0 ||
			description.trim().length === 0 ||
			people.trim().length === 0
		) {
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

const projectInput = new ProjectInput();
