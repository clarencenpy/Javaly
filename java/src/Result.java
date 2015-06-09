import java.util.*;

public class Result {
    private ArrayList<ResultItem> results;
    private boolean success = true;

    public Result() {
        results = new ArrayList<>();
    }

    public void add(ResultItem item) {
        results.add(item);
        if (!item.isSuccess()) {
            success = false;
        }
    }

    public boolean isSuccess() {
        return success;
    }

    public ArrayList<ResultItem> getResults() {
        return results;
    }

}
