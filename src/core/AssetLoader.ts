import { Assets, Spritesheet } from "pixi.js";
import { Debug } from "../utils/debug";

// определение типа Asset, который описывает игровой ресурс.
type Asset = {
	name: string;
	url: string;
	ext: string;
	category: string;
	group: string;
};

//экспорт объекта spritesheets, который является пустым словарём типа Spritesheet.
export const spritesheets: Record<string, Spritesheet> = {};

//экспорт класса AssetLoader.
export default class AssetLoader {
	private assetFileUrls = this.importAssetFiles();

	//публичное свойство manifest, которое представляет собой массив игровых ресурсов типа Asset.
	manifest: Asset[];

	//конструктор, который инициализирует свойство manifest результатом работы метода generateManifest().
	constructor() {
		this.manifest = this.generateManifest();
	}

	/**
	 * метод, который возвращает все пути к игровым ресурсам в папке public.**/
	importAssetFiles() {
		const assetFiles = import.meta.glob("/public/**/*.*");

		return Object.keys(assetFiles);
	}

	/**
	 * асинхронный метод, который загружает все игровые ресурсы, относящиеся к определённой группе, используя manifest.**/
	async loadAssetsGroup(group: string) {
		const sceneAssets = this.manifest.filter((asset) => asset.group === group);

		for (const asset of sceneAssets) {
			Assets.add(asset.name, asset.url);
		}

		const resources = await Assets.load(sceneAssets.map((asset) => asset.name));

		Debug.log("✅ Loaded assets group", group, resources);

		this.prepareSpritesheets(resources);

		return resources;
	}

	/**
	 *  метод, который добавляет все спрайты из загруженных ресурсов типа Spritesheet в объект spritesheets.
	 *  **/
	prepareSpritesheets(resources: Record<string, Spritesheet>) {
		for (const [name, resource] of Object.entries(resources)) {
			if (!("animations" in resource)) continue;

			spritesheets[name] = resource;
		}
	}

	/**
	 * метод, который генерирует массив игровых ресурсов manifest из путей к файлам игровых ресурсов.**/
	generateManifest() {
		const assetsManifest: Asset[] = [];
		const assetPathRegexp =
			/public\/(?<group>[\w.-]+)\/(?<category>[\w.-]+)\/(?<name>[\w.-]+)\.(?<ext>\w+)$/;

		this.assetFileUrls.forEach((assetPath) => {
			const match = assetPathRegexp.exec(assetPath);

			if (!match || !match.groups) {
				return console.error(
					`Invalid asset path: ${assetPath}, should match ${assetPathRegexp}`
				);
			}

			const { group, category, name, ext } = match.groups;

			if (category === "spritesheets" && ext !== "json") {
				// Skip image files in spritesheets category
				return;
			}

			assetsManifest.push({
				group,
				category,
				name,
				ext,
				url: assetPath.replace(/.*public/, ""),
			});
		});

		return assetsManifest;
	}
}
