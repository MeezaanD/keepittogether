export interface Topic {
	id: string;
	name: string;
	description?: string;
	projects: Project[];
}

export interface Project {
	id: string;
	title: string;
	description: string;
	status: ProjectStatus;
	startDate: string;
	endDate: string | null;
	notes: Note[];
}

export type ProjectStatus = 'in-progress' | 'completed' | 'not-started';

export interface Note {
	date: string;
	content: string;
}