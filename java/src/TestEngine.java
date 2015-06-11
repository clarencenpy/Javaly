import com.google.gson.*;

import java.io.*;

/**
 * This is a TestEngine variant used to capture stdout for testing
 */
public class TestEngine {
    private static ByteArrayOutputStream outContent = new ByteArrayOutputStream();
//    private static ByteArrayOutputStream errContent = new ByteArrayOutputStream();

    public static void main(String[] args) throws Exception {
        //save the original first
        PrintStream sysOut = System.out;
//        PrintStream sysErr = System.err;

        //redirect stdout and stderr
        System.setOut(new PrintStream(outContent));
//        System.setErr(new PrintStream(errContent));

        //run the test code
        ResultSet r = Test.run(outContent);

        //switching back
        System.setOut(sysOut);
//        System.setErr(sysErr);

        //Output the result as JSON to System.out
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println(gson.toJson(r));
    }

}