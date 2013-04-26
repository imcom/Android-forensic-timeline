package imcom.forensics;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

import android.content.Context;
import android.os.Environment;
import android.util.Log;

public class SDWriter {
	
	private static final String LOG_TAG = "IMCOM-SD-Writer";
	private static Context context;
	private static final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyyMMddkkmm", Locale.US);

	public SDWriter(Context ctx) throws TimelineException {
		String state = Environment.getExternalStorageState();
		if (state == null || !Environment.MEDIA_MOUNTED.equals(state)) {
			//TODO logging
			throw new TimelineException(context.getString(R.string.external_storage_is_unavailable));
		} else {
			context = ctx;
		}
	}
	
	private File initStorageDirectory(String investigation, String tag) throws TimelineException {
		String date = dateFormat.format(new Date());
		String path = investigation + File.separatorChar + tag + "_" + date;
		File storage_dir = new File(Environment.getExternalStorageDirectory(), path);
		
		if (!storage_dir.mkdirs() && !storage_dir.exists()) {
			throw new TimelineException(context.getString(R.string.unable_to_create_directories));
		}
		
		Log.d(LOG_TAG, "Created directory: " + storage_dir.getAbsolutePath());
		return storage_dir;
	}
	
	public File getStorageDirectory(String investigation, String tag) throws TimelineException {

		File storage_dir = initStorageDirectory(investigation, tag);
		
		if (storage_dir == null || storage_dir.isFile()) {
			if (storage_dir != null) Log.e(LOG_TAG, "Target directory is a file");
			throw new TimelineException(context.getString(R.string.failed_to_get_storage_directory));
		}
		
		return storage_dir;
	}
	
}
