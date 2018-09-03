package org.oiran.jar.AviUtlTool;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Desktop;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.datatransfer.DataFlavor;
import java.awt.datatransfer.Transferable;
import java.awt.dnd.DnDConstants;
import java.awt.dnd.DropTarget;
import java.awt.dnd.DropTargetAdapter;
import java.awt.dnd.DropTargetDropEvent;
import java.awt.event.WindowEvent;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;
import java.util.Map.Entry;

import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.border.EmptyBorder;

public class App extends JFrame {
    static App instance;
    private JLabel bgImg;
    private StatusBar statusBar;

    public App() {
        setTitle("kiriharikun");
        setSize(350, 230);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		try {
	        bgImg = new JLabel(new ImageIcon(Cmd.getExternalFile("img/dropimg.png").getAbsolutePath()));
	        JPanel p1 = new JPanel();
            p1.setBorder(new EmptyBorder(50, 50, 50, 50));
            p1.setLayout(new GridBagLayout());
            GridBagConstraints gbc = new GridBagConstraints();
            gbc.gridwidth = GridBagConstraints.REMAINDER;
            gbc.fill = GridBagConstraints.HORIZONTAL;
	        p1.setBackground(Color.decode("#dddddd"));
	        p1.add(bgImg);
	        getContentPane().add(p1, BorderLayout.CENTER);
		} catch (URISyntaxException e) {
			e.printStackTrace();
		}

        statusBar = new StatusBar();
        statusBar.setBackground(Color.decode("#dddddd"));
        getContentPane().add(statusBar, BorderLayout.SOUTH);
    }

    public void setBgImg(String path) {
    	if (bgImg != null) {
    		try {
    			bgImg.setIcon(new ImageIcon(Cmd.getExternalFile(path).getAbsolutePath()));
    		} catch (URISyntaxException e) {
    			e.printStackTrace();
    		}
    	}
    }

    public static void main(String[] args){
        instance = new App();
        DropTarget target = new DropTarget(instance, new VideoDropTargetAdapter());
        instance.setVisible(true);
    }

    public void exit() {
        instance.dispatchEvent(new WindowEvent(instance, WindowEvent.WINDOW_CLOSING));
    }

    public void setStatusMessage(String message, Status status) {
        statusBar.setMessage(message);
        statusBar.setForeground(status.getColor());
    }
}
class StatusBar extends JLabel {
    public StatusBar() {
        super();
        setMessage("");
        setOpaque(true);
        setBounds(0, 0, 200, 16);
    }

    public void setMessage(String message) {
        setText(message);
    }
}
enum Status {
	SUCESS("#888888"),
	ERROR("#bf1616");

	private final String colorCode;

	Status(String colorCode) {
		this.colorCode = colorCode;
	}

	public Color getColor() {
		return Color.decode(this.colorCode);
	}
}
class VideoDropTargetAdapter extends DropTargetAdapter{
    static List<String> vparamToSendList;
    static List<String> aparamToSendList;
    static List<String> fparamToSendList;
    static {
        String[] vstreamParamToSend = {
                "width",
                "height",
                "r_frame_rate",
                "duration",
                "nb_frames"
        };
        String[] astreamParamToSend = {
                "sample_rate"
        };
        String[] fstreamParamToSend = {
                "size"
        };
        vparamToSendList = Arrays.asList(vstreamParamToSend);
        aparamToSendList = Arrays.asList(astreamParamToSend);
        fparamToSendList = Arrays.asList(fstreamParamToSend);
    }
    public void drop(DropTargetDropEvent dtde) {
    	App.instance.setBgImg("img/loadingimg.png");
        try {
            Transferable transfer = dtde.getTransferable();
            if (transfer.isDataFlavorSupported(DataFlavor.javaFileListFlavor)) {
                dtde.acceptDrop(DnDConstants.ACTION_COPY_OR_MOVE);
                List<File> fileList = (List<File>) transfer.getTransferData(DataFlavor.javaFileListFlavor);
                if (fileList.size() == 1) {
                    File f = fileList.get(0);
                    if (f.getName().endsWith(".mp4")) {
                        Mp4 mp4 = new Mp4(f);
                        if (mp4.loadMetadata()) {
                            Desktop desktop = Desktop.getDesktop();
                            File fp = Cmd.getExternalFile("html/index.html");
                            File fj = Cmd.getExternalFile("html/data.js");
                            String jsStr = "";
                            String vq = "";
                            for (Entry<String, String> entry : mp4.vstream_metadatas.entrySet()) {
                                if (vparamToSendList.contains(entry.getKey())) {
                                    vq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (vq.length() > 0) {
                                jsStr += "const JAVA_VIDEO_STREAM = '"+vq.substring(1)+"';";
                            }

                            String aq = "";
                            for (Entry<String, String> entry : mp4.astream_metadatas.entrySet()) {
                                if (aparamToSendList.contains(entry.getKey())) {
                                    aq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (aq.length() > 0) {
                                jsStr += "const JAVA_AUDIO_STREAM = '"+aq.substring(1)+"';";
                            }

                            String fq = "";
                            for (Entry<String, String> entry : mp4.format_metadatas.entrySet()) {
                                if (fparamToSendList.contains(entry.getKey())) {
                                    fq += "&" + escape(entry.getKey()) + "=" + escape(entry.getValue());
                                }
                            }
                            if (fq.length() > 0) {
                                jsStr += "const JAVA_FORMAT = '"+fq.substring(1)+"';";
                            }

                            jsStr += "const JAVA_FILE_PATH='"+escape(f.getAbsolutePath())+"';";

                            OutputStreamWriter writer = new OutputStreamWriter(new FileOutputStream(fj), "UTF-8");

                            writer.write(jsStr);
                            writer.close();

                            desktop.browse(fp.toURI());
                            App.instance.exit();
                            return;
                        } else {
                            App.instance.setStatusMessage(" failed to load video metadata", Status.ERROR);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    	App.instance.setBgImg("img/dropimg.png");
    }
    public String escape(String s){
        return s.replaceAll("'", "&apos;").replaceAll("\\\\", "\\\\\\\\");
    }
}
