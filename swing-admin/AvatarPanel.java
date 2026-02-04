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

    /**
     * Create the panel and basic layout for avatar display.
     *
     * @param client HTTP client used to fetch avatar bytes
     *
     * **Side effects**: creates Swing labels and adds them to the panel
     */
    public AvatarPanel(HTTPClient client) {
        super(new BorderLayout());
        this.client = client;
        avatarLabel.setPreferredSize(new Dimension(160, 160));
        add(title, BorderLayout.NORTH);
        add(avatarLabel, BorderLayout.CENTER);
    }

    /**
     * Show the selected user (name + avatar).
     *
     * @param user selected row from the table (may be null)
     *
     * **Output**: none
     * **Side effects**: updates Swing labels, triggers background download
     *
     * **Logic**
     * - If null: reset UI -> return.
     * - Else: set title -> load avatar asynchronously.
     */
    public void showUser(UserRow user) {
        if (user == null) {
            title.setText("No user selected");
            avatarLabel.setIcon(null);
            return;
        }
        title.setText(user.username);
        loadAvatar(user.id);
    }

    /**
     * Reset the panel to "no user selected".
     */
    public void clear() {
        title.setText("No user selected");
        avatarLabel.setIcon(null);
    }

    /**
     * Fetch avatar bytes in a background thread and update the UI when done.
     *
     * @param userId user id to fetch avatar for
     *
     * **Key term**
     * - *Image scaling*: we resize to 120x120 so the UI stays neat.
     */
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

