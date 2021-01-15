//Project class
enum ProjectStatus {
	Active,
	Finished,
}

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public numPeople: number,
		public status: ProjectStatus
	) {}
}

//Project State

type Listner<T> = (item: T[]) => void;

class State<T> {
	protected listners: Listner<T>[] = [];
	addListner(listner: Listner<T>) {
		this.listners.push(listner);
	}
}

class ProjectState extends State<Project> {
	private projects: Project[] = [];

	private static instance: ProjectState;

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}

	addProject(title: string, description: string, numPeople: number) {
		const newProject = new Project(
			Math.random().toString(),
			title,
			description,
			numPeople,
			ProjectStatus.Active
		);
		this.projects.push(newProject);
		for (const listner of this.listners) {
			listner(this.projects.slice());
		}
	}
}

const projectState = ProjectState.getInstance();

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

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;
		const importedNode = document.importNode(this.templateElement.content, true);
		this.element = importedNode.firstElementChild as U;
		if (newElementId) {
			this.element.id = newElementId;
		}
		this.attach(insertAtStart);
	}
	private attach(insertBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			insertBeginning ? 'afterbegin' : 'beforeend',
			this.element
		);
	}
	abstract configure(): void;
	abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInput: HTMLInputElement;
	descriptionInput: HTMLInputElement;
	peopleInput: HTMLInputElement;
	constructor() {
		super('project-input', 'app', true, 'user-input');

		this.titleInput = this.element.querySelector('#title') as HTMLInputElement;
		this.descriptionInput = this.element.querySelector('#description') as HTMLInputElement;
		this.peopleInput = this.element.querySelector('#people') as HTMLInputElement;

		this.configure();
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
			projectState.addProject(title, description, people);
		}
	}

	renderContent() {}

	configure() {
		this.element.addEventListener('submit', this.handleFormSubmit.bind(this));
	}
}

//Project Item Class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
	private project: Project;
	get numPersons() {
		if (this.project.numPeople === 1) {
			return '1 person assigned';
		} else {
			return `${this.project.numPeople} people assigned`;
		}
	}
	constructor(hostId: string, project: Project) {
		super('single-project', hostId, false, project.id);
		this.project = project;

		this.configure();
		this.renderContent();
	}
	configure() {}
	renderContent() {
		this.element.querySelector('h2')!.textContent = this.project.title;
		this.element.querySelector('h4')!.textContent = this.numPersons;
		this.element.querySelector('p')!.textContent = this.project.description;
	}
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assingedProjects: Project[] = [];
	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);
		this.assingedProjects = [];
		this.element.id = `${this.type}-projects`;
		this.configure();
		this.renderContent();
	}

	configure() {
		projectState.addListner((projects: Project[]) => {
			const filteredProjects = projects.filter((project) => {
				if (this.type === 'active') {
					return project.status === ProjectStatus.Active;
				}
				return project.status === ProjectStatus.Finished;
			});
			this.assingedProjects = filteredProjects;
			this.renderProjects();
		});
	}

	renderProjects() {
		const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLElement;
		listEl.innerHTML = '';
		for (const projectItem of this.assingedProjects) {
			new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
		}
	}

	renderContent() {
		const listId = `${this.type}-project-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.innerText = this.type.toUpperCase() + ' PROJECTS';
	}
}
const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
