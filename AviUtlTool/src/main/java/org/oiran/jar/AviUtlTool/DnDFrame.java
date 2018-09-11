package org.oiran.jar.AviUtlTool;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.GridBagConstraints;
import java.awt.GridBagLayout;
import java.awt.dnd.DropTargetAdapter;
import java.awt.dnd.DropTargetDropEvent;
import java.awt.event.WindowEvent;
import java.io.File;

import javax.swing.ImageIcon;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPanel;
import javax.swing.border.EmptyBorder;

public class DnDFrame  extends JFrame {
	private JLabel bgImg;
	private StatusBar statusBar;

	public DnDFrame() {
		setTitle("kiriharikun");
		setSize(350, 230);
		setLocationRelativeTo(null);
		setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

		File bg = App.RESOURCE.getLoadedResource("img/dropimg.png");

		if (bg == null || !bg.exists()) {
			bgImg = new JLabel(new ImageIcon());
		} else {
			bgImg = new JLabel(new ImageIcon(bg.getAbsolutePath()));
		}

		JPanel p1 = new JPanel();
		p1.setBorder(new EmptyBorder(50, 50, 50, 50));
		p1.setLayout(new GridBagLayout());
		GridBagConstraints gbc = new GridBagConstraints();
		gbc.gridwidth = GridBagConstraints.REMAINDER;
		gbc.fill = GridBagConstraints.HORIZONTAL;

		p1.setBackground(Color.decode("#dddddd"));
		p1.add(bgImg);

		getContentPane().add(p1, BorderLayout.CENTER);

		statusBar = new StatusBar();
		statusBar.setBackground(Color.decode("#dddddd"));
		getContentPane().add(statusBar, BorderLayout.SOUTH);
	}

	public void setBgImg(File imgFile) {
		bgImg.setIcon(new ImageIcon(imgFile.getAbsolutePath()));
	}

	public void exit(DnDFrame instance) {
		dispatchEvent(new WindowEvent(instance, WindowEvent.WINDOW_CLOSING));
	}

	public void setStatusMessage(String key, Status status) {
		statusBar.setComponentMessage(key, status);
	}
}


class VideoDropTargetAdapter extends DropTargetAdapter{
	public void drop(DropTargetDropEvent dtde) {
		App.message("", Status.SUCESS);
		App.FRAME.setBgImg(App.RESOURCE.getLoadedResource("img/loadingimg.png"));
		App.dropHandle(dtde);
		App.FRAME.setBgImg(App.RESOURCE.getLoadedResource("img/dropimg.png"));
	}
}