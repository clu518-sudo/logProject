package pccit.finalproject.javaclient.ui;

import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Arrays;
import javax.imageio.ImageIO;

/**
 * JPanel that displays the selected user's username and profile image (thumbnail).
 * Image is loaded asynchronously so the Swing application does not freeze.
 */
public class AvatarPanel extends JPanel {

    private static final int THUMBNAIL_SIZE = 120;
    private static final Dimension PREF_SIZE = new Dimension(200, 180);

    private final JLabel usernameLabel;
    private final JLabel imageLabel;

    public AvatarPanel() {
        setLayout(new BorderLayout(0, 8));
        setBorder(BorderFactory.createTitledBorder("Selected User"));
        setPreferredSize(PREF_SIZE);

        usernameLabel = new JLabel("(no selection)", SwingConstants.CENTER);
        usernameLabel.setFont(usernameLabel.getFont().deriveFont(Font.BOLD, 14f));

        imageLabel = new JLabel();
        imageLabel.setPreferredSize(new Dimension(THUMBNAIL_SIZE, THUMBNAIL_SIZE));
        imageLabel.setHorizontalAlignment(SwingConstants.CENTER);
        imageLabel.setVerticalAlignment(SwingConstants.CENTER);
        imageLabel.setBorder(BorderFactory.createEtchedBorder());

        JPanel centerPanel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        centerPanel.add(imageLabel);

        add(usernameLabel, BorderLayout.NORTH);
        add(centerPanel, BorderLayout.CENTER);
        clearSelection();
    }

    /** Show placeholder when no row is selected. */
    public void clearSelection() {
        usernameLabel.setText("(no selection)");
        imageLabel.setIcon(null);
        imageLabel.setText("—");
    }

    /** Set username immediately; image will be loaded async and set via setAvatarImage. */
    public void setSelectedUsername(String username) {
        usernameLabel.setText(username != null ? username : "(no selection)");
        imageLabel.setIcon(null);
        imageLabel.setText("Loading…");
    }

    /** Set avatar image from bytes (call from EDT, e.g. from SwingWorker done()). */
    public void setAvatarImage(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            imageLabel.setIcon(null);
            imageLabel.setText("No image");
            return;
        }
        try {
            BufferedImage img = ImageIO.read(new ByteArrayInputStream(imageBytes));
            if (img != null) {
                Image scaled = img.getScaledInstance(THUMBNAIL_SIZE, THUMBNAIL_SIZE, Image.SCALE_SMOOTH);
                imageLabel.setIcon(new ImageIcon(scaled));
                imageLabel.setText(null);
            } else {
                imageLabel.setIcon(null);
                imageLabel.setText("Invalid image");
            }
        } catch (Exception e) {
            imageLabel.setIcon(null);
            imageLabel.setText("Error");
        }
    }

    /** Show error state for avatar load. */
    public void setAvatarError() {
        imageLabel.setIcon(null);
        imageLabel.setText("Error loading");
    }
}
