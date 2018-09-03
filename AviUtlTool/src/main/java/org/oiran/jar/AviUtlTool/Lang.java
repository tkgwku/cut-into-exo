package org.oiran.jar.AviUtlTool;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;

public class Lang {
	Map<String, String> langMap;

	public Lang(File f){
		langMap = new HashMap<String, String>();

		FileInputStream fis;
		try {
			fis = new FileInputStream(f);
		} catch (FileNotFoundException e) {
			return;// wont happen
		}

		BufferedReader br = null;
		try {
			br = new BufferedReader(new InputStreamReader(fis, "UTF-8"));
		} catch (UnsupportedEncodingException e) {
			App.instance.setStatusMessage("ErrorLangEncodingUnsupported", Status.ERROR);
			try {
				fis.close();
			} catch (IOException e1) {
			}
			return;
		}

		while (true) {
			String line = null;
			try {
				line = br.readLine();
			} catch (IOException e) {
				App.instance.setStatusMessage("ErrorReadLang", Status.ERROR);
				try {
					br.close();
				} catch (IOException e1) {
				}
				return;
			}
			if (line == null) {
				break;
			} else {
				if (line.matches("^[^=]+=[^=]+$")) {
					String[] s = line.split("=");
					langMap.put(s[0], s[1]);
				}
			}
		}

		try {
			br.close();
		} catch (IOException e) {
		}
	}

	public String get(String key) {
		if (langMap.containsKey(key)) {
			return langMap.get(key);
		}
		return key;
	}
}
