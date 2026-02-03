import javax.swing.table.AbstractTableModel;
import java.util.ArrayList;
import java.util.List;

/**
 * MVC TableModel for user data.
 *
 * Responsibilities (as per planning docs):
 * - Manages user list
 * - Column definitions
 * - Notifies listeners on data updates
 */
public class UserTableModel extends AbstractTableModel {
    private final String[] columns = {"Username", "Real Name", "DOB", "Articles"};
    private List<UserRow> users = new ArrayList<>();

    public void setUsers(List<UserRow> list) {
        users = list != null ? list : new ArrayList<>();
        fireTableDataChanged();
    }

    public UserRow getUserAt(int row) {
        return users.get(row);
    }

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return columns.length;
    }

    @Override
    public String getColumnName(int column) {
        return columns[column];
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        UserRow u = users.get(rowIndex);
        switch (columnIndex) {
            case 0:
                return u.username;
            case 1:
                return u.realName;
            case 2:
                return u.dob;
            case 3:
                return u.articleCount;
            default:
                return "";
        }
    }
}

/**
 * Package-private DTO for the Swing app.
 * Kept non-public so the Swing admin stays aligned with the "6 Java files" plan.
 */
class UserRow {
    int id;
    String username;
    String realName;
    String dob;
    int articleCount;
    boolean isAdmin;
}

