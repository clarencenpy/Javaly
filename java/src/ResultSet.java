import java.util.*;

public class ResultSet {
    private ArrayList<Result> results;
    private boolean success = true;

    public ResultSet() {
        results = new ArrayList<>();
    }

    public void add(Result item) {
        results.add(item);
        if (!item.isSuccess()) {
            success = false;
        }
    }

    public boolean isSuccess() {
        return success;
    }

    public ArrayList<Result> getResults() {
        return results;
    }

}
