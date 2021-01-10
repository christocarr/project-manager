class ProjectInput {
	formTemplate: HTMLTemplateElement;
	wrapperDiv: HTMLDivElement;
	formElement: HTMLFormElement;
	constructor() {
		this.formTemplate = document.getElementById('project-input')! as HTMLTemplateElement;
		this.wrapperDiv = document.getElementById('app')! as HTMLDivElement;

		const importedFormElement = document.importNode(this.formTemplate.content, true);
		this.formElement = importedFormElement.firstElementChild as HTMLFormElement;

		this.insertForm();
	}

	private insertForm() {
		this.wrapperDiv.insertAdjacentElement('afterbegin', this.formElement);
	}
}

const project = new ProjectInput();
