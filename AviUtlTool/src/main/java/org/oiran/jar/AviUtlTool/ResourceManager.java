package org.oiran.jar.AviUtlTool;

import java.io.File;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.CodeSource;
import java.util.HashMap;
import java.util.Map;

public class ResourceManager {
	boolean isResourceReady = false;

	static final String[] NECESSARY_RESOURCES = {
			"html/index.html",
			"html/dom.js",
			"html/encoding.min.js",
			"html/components.js",
			"ffmpeg/bin/ffprobe.exe",
			"img/dropimg.png",
			"img/loadingimg.png",
			"lang/ja_JP.lang"
	};

	Map<String, File> loadedResources = new HashMap<String, File>();

	public ResourceManager() {
		isResourceReady = check();
	}

	private boolean check() {
		for(String path : NECESSARY_RESOURCES) {
			File f = getExternalFile(path);
			if (f.exists()) {
				loadedResources.put(path, f);
			} else {
				System.out.println(path);
				return false;
			}
		}
		return true;
	}

	public File getLoadedResource(String pathStr) {
		if (loadedResources.containsKey(pathStr)) {
			return loadedResources.get(pathStr);
		}
		return null;
	}

	public static URI getJarURI(Class<?> clazz) {
		CodeSource cs = clazz.getProtectionDomain().getCodeSource();
		try {
			return cs.getLocation().toURI();
		} catch (URISyntaxException e) {
			App.message("ErrorJarPathNotDetected", Status.ERROR);
			return null;
		}
	}

	public static File getExternalFile(String pathStr) {
		URI jarURI = getJarURI(App.class);

		if (jarURI == null) return null;

		Path jarPath = Paths.get(jarURI);

		String extPath = ("/"+pathStr).replaceAll("/", File.separator.replace("\\", "\\\\"));

		return new File(jarPath.getParent() + extPath);
	}
}
