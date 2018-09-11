package org.oiran.jar.AviUtlTool;

import java.awt.Desktop;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.datatransfer.UnsupportedFlavorException;
import java.awt.dnd.DnDConstants;
import java.awt.dnd.DropTarget;
import java.awt.dnd.DropTargetDropEvent;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import java.util.Map.Entry;

public class App{
	static App INSTANCE;
	static ResourceManager RESOURCE;
	static DnDFrame FRAME;
	static Lang LANG;

	static List<String> VIDEO_METADATA_TO_SAVE;
	static List<String> AUDIO_METADATA_TO_SAVE;
	static List<String> FORMAT_METADATA_TO_SAVE;

	static {
		String[] v = {
				"width",
				"height",
				"r_frame_rate",
				"duration",
				"nb_frames"
		};
		String[] a = {
				"sample_rate"
		};
		String[] f = {
				"size"
		};
		VIDEO_METADATA_TO_SAVE = Arrays.asList(v);
		AUDIO_METADATA_TO_SAVE = Arrays.asList(a);
		FORMAT_METADATA_TO_SAVE = Arrays.asList(f);
	}

	public App() {}

	public static void main(String[] args){
		RESOURCE = new ResourceManager();
		LANG = new Lang(RESOURCE.getLoadedResource("lang/ja_JP.lang"));
		FRAME = new DnDFrame();

		if (RESOURCE.isResourceReady) {
			DropTarget target = new DropTarget(FRAME, new VideoDropTargetAdapter());
		} else {
			message("ErrorResourceNotFound", Status.ERROR);
		}

		FRAME.setVisible(true);
	}

	private void exit() {
		FRAME.exit(FRAME);
	}

	static void message(String key, Status status) {
		App.FRAME.setStatusMessage(key, status);
	}

	static boolean dropHandle(DropTargetDropEvent dtde) {
		Transferable transfer = dtde.getTransferable();

		if (!transfer.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
			message("ErrorDataFlavorSupported", Status.ERROR);
			return false;
		}

		dtde.acceptDrop(DnDConstants.ACTION_COPY_OR_MOVE);

		List<File> fileList;
		try {
			fileList = (List<File>) transfer.getTransferData(DataFlavor.javaFileListFlavor);
		} catch (UnsupportedFlavorException e) {
			message("ErrorDataFlavorSupported", Status.ERROR);
			return false;
		} catch (IOException e) {
			message("ErrorIODnD", Status.ERROR);
			return false;
		}

		if (fileList.size() != 1) {
			message("ErrorIOTooManyFile", Status.ERROR);
			return false;
		}

		return saveMetadataToJS(fileList.get(0));
	}

	private static boolean saveMetadataToJS(File file) {
		if(!checkFileSupported(file.getName())) {
			return false;
		}

		Mp4 mp4 = new Mp4(file);

		if(!mp4.loadMetadata()) {
			return false;
		}

		File fp = RESOURCE.getLoadedResource("html/index.html");
		File fj = RESOURCE.getExternalFile("html/data.js");

		if(!tryCreate(fj)) {
			return false;
		}
		if(!write(fj, generateMetadataString(mp4))) {
			return false;
		}
		if(!openBrowser(fp.toURI())) {
			return false;
		}

		return true;
	}

	/////////////////////

	private static boolean checkFileSupported(String filename) {
		String[] formatSupported = {"mov","mp4","m4a","3gp","3g2","mj2","avi"};
		for (String f : formatSupported) {
			if (filename.matches(".*\\."+f+"$")) {
				return true;
			}
		}
		message("ErrorFileType", Status.ERROR);
		return false;
	}

	private static boolean tryCreate(File f) {
		if (f.exists()) return true;
		try {
			f.createNewFile();
			return true;
		} catch (IOException e) {
			message("ErrorJSChouldntCreated", Status.ERROR);
			return false;
		}
	}

	private static String escape(String s){
		return s.replaceAll("'", "&apos;").replaceAll("\\\\", "\\\\\\\\");
	}

	@SuppressWarnings("resource")
	private static boolean write(File target, String content) {
		OutputStreamWriter writer;
		try {
			writer = new OutputStreamWriter(new FileOutputStream(target), "UTF-8");
		} catch (UnsupportedEncodingException e) {
			message("ErrorWriteEncindingUnsupported", Status.ERROR);
			return false;
		} catch (FileNotFoundException e) {
			return false;// wont happen
		}

		try {
			writer.write(content);
		} catch (IOException e) {
			message("ErrorWritingDenied", Status.ERROR);
			return false;
		}
		try {
			writer.close();
		} catch (IOException e) {
			message("ErrorWriterCouldntClosed", Status.ERROR);
			return false;
		}

		return true;
	}

	private static boolean openBrowser(URI uri) {
		Desktop desktop = Desktop.getDesktop();

		try {
			desktop.browse(uri);
		} catch (IOException e) {
			message("ErrorBrowser", Status.ERROR);
			return false;
		}

		return true;
	}

	private static String generateMetadataString(Mp4 mp4) {
		String j = "";

		String vq = "";
		for (Entry<String, String> entry : mp4.vstream_metadatas.entrySet()) {
			if (VIDEO_METADATA_TO_SAVE.contains(entry.getKey())) {
				vq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
			}
		}
		if (vq.length() > 0) {
			j += "const JAVA_VIDEO_STREAM = '"+vq.substring(1)+"';";
		}

		String aq = "";
		for (Entry<String, String> entry : mp4.astream_metadatas.entrySet()) {
			if (AUDIO_METADATA_TO_SAVE.contains(entry.getKey())) {
				aq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
			}
		}
		if (aq.length() > 0) {
			j += "const JAVA_AUDIO_STREAM = '"+aq.substring(1)+"';";
		}

		String fq = "";
		for (Entry<String, String> entry : mp4.format_metadatas.entrySet()) {
			if (FORMAT_METADATA_TO_SAVE.contains(entry.getKey())) {
				fq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
			}
		}
		if (fq.length() > 0) {
			j += "const JAVA_FORMAT = '"+fq.substring(1)+"';";
		}

		j += "const JAVA_FILE_PATH='"+escape(mp4.file.getAbsolutePath())+"';";

		return j;
	}
}
