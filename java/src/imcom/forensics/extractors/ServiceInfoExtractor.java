package imcom.forensics.extractors;

import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import imcom.forensics.FormatHelper;
import android.app.ActivityManager;
import android.app.ActivityManager.RunningServiceInfo;
import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;

public class ServiceInfoExtractor extends GenericExtractor {
	
	private static int MAX_SERVICES = 100;

	public ServiceInfoExtractor(String extractor_name) {
		super(extractor_name);
		// TODO Auto-generated constructor stub
	}
	
	public int extract(ContentResolver resolver, Context context, File dst_dir) {
		Log.d(LOG_TAG, extractor_name + " launches");
		long btime = 0;
		try {
			Process cat_process = Runtime.getRuntime().exec("cat /proc/stat");
			DataInputStream dis = new DataInputStream(cat_process.getInputStream());
			cat_process.waitFor();
			String line = null;
			do {
				line = dis.readLine();
				if (line.startsWith("btime")) {
					btime = Long.parseLong(line.split(" ")[1]);
					break;
				}
			} while(line != null);
			dis.close();
		} catch (IOException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		int service_num = 0;
		try {
			BufferedWriter writer = new BufferedWriter(
					new FileWriter(
							new File(dst_dir, this.getExtractorName() + ".pjson")
							)
					);
			
			ActivityManager activity_manager = (ActivityManager) context.getSystemService(
					Context.ACTIVITY_SERVICE
					);
			List<RunningServiceInfo> runningServices = activity_manager.getRunningServices(MAX_SERVICES);
			
			service_num = runningServices.size();
			for (RunningServiceInfo service_info : runningServices) {
				writer.write(helper.formatString("name", service_info.process));
				writer.write(" ");
				writer.write("pid:" + service_info.pid);
				writer.write(" ");
				writer.write("launch_date:" + (service_info.activeSince/1000 + btime));
				writer.write(" ");
				writer.write("last_activity_date:" + (service_info.lastActivityTime/1000 + btime));
				writer.write("\n");
			}
			
			if (writer != null) writer.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return service_num;
	}

	@Override
	public void setContentUri(Uri uri) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setProjection(String[] projection) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSelection(String selection) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSelectionArgs(String[] selection_args) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setSortOrder(String sort_order) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public String getSelection() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String[] getSelectionArgs() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getSortOrder() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String[] getProjection() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Uri getContentUri() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public String getExtractorName() {
		// TODO Auto-generated method stub
		return this.extractor_name;
	}

	@Override
	public void setFormat(FormatHelper helper) {
		// TODO Auto-generated method stub
		this.helper = helper;
	}

	@Override
	public String getFormatHelper() {
		// TODO Auto-generated method stub
		return null;
	}

}
