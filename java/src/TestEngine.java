import com.google.gson.*;

import java.io.*;

/**
 * This is a TestEngine variant used to capture stdout for testing
 */
public class TestEngine {
    private static ByteArrayOutputStream outContent = new ByteArrayOutputStream();
    private static ByteArrayOutputStream errContent = new ByteArrayOutputStream();

    public static void main(String[] args) throws Exception {
        //save the original first
        PrintStream sysOut = System.out;
        PrintStream sysErr = System.err;

        //redirect stdout and stderr
        System.setOut(new PrintStream(outContent));
        System.setErr(new PrintStream(errContent));

        //run the test code
        Result r = test();

        //switching back
        System.setOut(sysOut);
        System.setErr(sysErr);

        //Output the result as JSON to System.out
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        System.out.println(gson.toJson(r));
    }

    public static Result test() {
        Result r = new Result();

        int[] arr = {1,2,3,4};
        String expectedOutput = "10";

        try {
            Adder.add(arr);
            String actualOutput = outContent.toString();
            actualOutput = actualOutput.substring(0, actualOutput.length()-1); //remove trailing \n
            outContent.reset(); //clearing the ByteArrayOutputStream, or future calls will show duplicated data
            boolean success = expectedOutput.equals(actualOutput);
            r.add(new ResultItem(expectedOutput, actualOutput, success));
        } catch (Exception e) {
            e.printStackTrace(new PrintStream(errContent));
            String ex = errContent.toString();
            errContent.reset();
            r.add(new ResultItem(expectedOutput, ex, false));
        }


        int[] arr2 = {3,3,3,3};
        String expectedOutput2 = "12";

        try {
            Adder.add(arr2);
            String actualOutput = outContent.toString();
            actualOutput = actualOutput.substring(0, actualOutput.length()-1); //remove trailing \n
            outContent.reset(); //clearing the ByteArrayOutputStream, or future calls will show duplicated data
            boolean success = expectedOutput2.equals(actualOutput);
            r.add(new ResultItem(expectedOutput2, actualOutput, success));
        } catch (Exception e) {
            e.printStackTrace(new PrintStream(errContent));
            String ex = errContent.toString();
            errContent.reset();
            r.add(new ResultItem(expectedOutput, ex, false));
        }

        return r;
    }

}