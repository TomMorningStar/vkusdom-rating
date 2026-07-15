import JSZip from 'jszip';
import * as QRCode from 'qrcode';

type EmployeeQrData = {
	id: number;
	fullName: string;
};

const CARD_WIDTH = 900;
const CARD_HEIGHT = 980;
const QR_SIZE = 640;
const PADDING = 64;

function getAppOrigin() {
	const configuredOrigin = import.meta.env.VITE_PUBLIC_APP_URL?.trim();

	if (configuredOrigin) {
		return configuredOrigin.replace(/\/+$/, '');
	}

	return window.location.origin;
}

export function getEmployeeQrUrl(employeeId: number) {
	return `${getAppOrigin()}/employee/${employeeId}`;
}

export function getEmployeesListUrl() {
	return `${getAppOrigin()}/`;
}

function sanitizeFilename(value: string) {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-zа-яё0-9]+/gi, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

function loadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Не удалось создать QR-код'));
		img.src = src;
	});
}

function canvasToBlob(canvas: HTMLCanvasElement) {
	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(blob => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error('Не удалось подготовить файл QR-кода'));
			}
		}, 'image/png');
	});
}

function drawCenteredText(
	ctx: CanvasRenderingContext2D,
	text: string,
	y: number,
	maxWidth: number,
	lineHeight: number,
) {
	const words = text.split(/\s+/);
	const lines: string[] = [];
	let line = '';

	for (const word of words) {
		const nextLine = line ? `${line} ${word}` : word;

		if (ctx.measureText(nextLine).width <= maxWidth) {
			line = nextLine;
		} else {
			if (line) lines.push(line);
			line = word;
		}
	}

	if (line) lines.push(line);

	lines.slice(0, 2).forEach((currentLine, index) => {
		ctx.fillText(currentLine, CARD_WIDTH / 2, y + index * lineHeight);
	});
}

async function createQrCardBlob(url: string, label: string) {
	const qrDataUrl = await QRCode.toDataURL(url, {
		errorCorrectionLevel: 'H',
		margin: 2,
		width: QR_SIZE,
		color: {
			dark: '#111827',
			light: '#ffffff',
		},
	});
	const qrImage = await loadImage(qrDataUrl);

	const canvas = document.createElement('canvas');
	canvas.width = CARD_WIDTH;
	canvas.height = CARD_HEIGHT;

	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Canvas недоступен в браузере');
	}

	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

	ctx.fillStyle = '#f9fafb';
	ctx.fillRect(PADDING, PADDING, CARD_WIDTH - PADDING * 2, CARD_HEIGHT - PADDING * 2);

	ctx.drawImage(qrImage, (CARD_WIDTH - QR_SIZE) / 2, 100, QR_SIZE, QR_SIZE);

	ctx.textAlign = 'center';
	ctx.fillStyle = '#111827';
	ctx.font = '700 48px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
	drawCenteredText(ctx, label, 820, CARD_WIDTH - PADDING * 2, 58);

	return canvasToBlob(canvas);
}

export function createEmployeeQrBlob(employee: EmployeeQrData) {
	return createQrCardBlob(getEmployeeQrUrl(employee.id), employee.fullName);
}

export function createEmployeesListQrBlob(label = 'Сотрудники ВкусДом') {
	return createQrCardBlob(getEmployeesListUrl(), label);
}

export function getEmployeeQrFilename(employee: EmployeeQrData) {
	const name = sanitizeFilename(employee.fullName) || `employee-${employee.id}`;
	return `qr-${employee.id}-${name}.png`;
}

export async function downloadEmployeeQr(employee: EmployeeQrData) {
	const blob = await createEmployeeQrBlob(employee);
	downloadBlob(blob, getEmployeeQrFilename(employee));
}

export async function downloadEmployeesQrZip(employees: EmployeeQrData[]) {
	const zip = new JSZip();

	for (const employee of employees) {
		const blob = await createEmployeeQrBlob(employee);
		zip.file(getEmployeeQrFilename(employee), blob);
	}

	const archive = await zip.generateAsync({ type: 'blob' });
	downloadBlob(archive, 'employee-qr-codes.zip');
}

export async function downloadEmployeesListQr() {
	const blob = await createEmployeesListQrBlob();
	downloadBlob(blob, 'qr-employees-list.png');
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.append(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
