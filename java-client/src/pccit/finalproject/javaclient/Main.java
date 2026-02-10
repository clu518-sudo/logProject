package pccit.finalproject.javaclient;

import pccit.finalproject.javaclient.ui.AdminFrame;

import javax.swing.*;

/**
 * Entry point for the Java Swing administrator interface.
 * Connects to the Node.js backend to log in (admin), list users, view profile/avatar, and delete users.
 */
public class Main {

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception ignored) {
                // use default L&F
            }
            AdminFrame frame = new AdminFrame();
            frame.pack();
            frame.setLocationRelativeTo(null);
            frame.setVisible(true);
        });
    }
}
