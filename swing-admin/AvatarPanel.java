import javax.swing.*;
import java.awt.*;

/**
 * Avatar display panel (async image loading, no UI freeze).
 *
 * Responsibilities (as per planning docs):
 * - Fetch avatar from API
 * - Scale + display
 * - Uses SwingWorker for IO
 */
public class AvatarPanel extends JPanel {
    private final HTTPClient client;
    private final JLabel title = new JLabel("No user selected", SwingConstants.CENTER);
    private final JLabel avatarLabel = new JLabel("", SwingConstants.CENTER);

    public AvatarPanel(HTTPClient client) {
        super(new BorderLayout());
        this.client = client;
        avatarLabel.setPreferredSize(new Dimension(160, 160));
        add(title, BorderLayout.NORTH);
        add(avatarLabel, BorderLayout.CENTER);
    }

    public void showUser(UserRow user) {
        if (user == null) {
            title.setText("No user selected");
            avatarLabel.setIcon(null);
            return;
        }
        title.setText(user.username);
        loadAvatar(user.id);
    }

    public void clear() {
        title.setText("No user selected");
        avatarLabel.setIcon(null);
    }

    private void loadAvatar(int userId) {
        avatarLabel.setIcon(null);
        new SwingWorker<ImageIcon, Void>() {
            @Override
            protected ImageIcon doInBackground() throws Exception {
                byte[] bytes = client.fetchAvatarBytes(userId);
                ImageIcon icon = new ImageIcon(bytes);
                Image scaled = icon.getImage().getScaledInstance(120, 120, Image.SCALE_SMOOTH);
                return new ImageIcon(scaled);
            }

            @Override
            protected void done() {
                try {
                    avatarLabel.setIcon(get());
                } catch (Exception ex) {
                    avatarLabel.setIcon(null);
                }
            }
        }.execute();
    }
}

