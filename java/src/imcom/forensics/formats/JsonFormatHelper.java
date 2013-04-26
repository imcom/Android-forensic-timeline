package imcom.forensics.formats;

import android.util.Log;
import imcom.forensics.FormatHelper;

public class JsonFormatHelper extends FormatHelper {

	private static final String LOG_TAG = "IMCOM-Format-Helper";
	
	public JsonFormatHelper(String helper_name, char separator) {
		super(helper_name, separator);
		// TODO Auto-generated constructor stub
	}

	@Override
	public String formatString(String... targets) {
		// TODO Auto-generated method stub
		if (targets.length == 2) {
			return targets[0] + this.getSeparator() + targets[1];
		} else {
			Log.e(LOG_TAG, "skipping invalid values...");
			Log.e(LOG_TAG, "Problematic key: " + targets[0]);
			return null;
		}
	}

}
