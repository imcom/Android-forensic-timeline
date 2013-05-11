package imcom.forensics;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class UploadManager extends Service {

	private final static String log_file_prefix = "upload_buffer_";
	public void onCreate() {
		Log.d(getString(R.string.imcom_forensics), "Upload manager created");
	}
	
	private void startUpload() {
		// TODO Auto-generated method stub
		HttpClient uploader = new DefaultHttpClient();
		String[] logs = {"main", "system", "events", "radio"};
		//HttpPost bearer = new HttpPost("http://216.108.229.28:2222/upload_log");
		HttpPost bearer = new HttpPost("http://192.168.1.44:2222/upload_log");
		List<NameValuePair> payload = new ArrayList<NameValuePair>();
		try {
			Process p = Runtime.getRuntime().exec("su");
			DataOutputStream commander =  new DataOutputStream(p.getOutputStream());
			// retrieve logs and store them into files
			for (String log : logs) {
				Log.d(getString(R.string.imcom_forensics), "gathering log: " + log);
				File file = new File(getExternalFilesDir(null), log_file_prefix + log);
				String cmd = "logcat -v time -b " + log + " -d > " + file.getAbsolutePath();
				commander.writeBytes(cmd);
				commander.writeByte('\n'); // enter the command
				commander.flush();
				Log.d(getString(R.string.imcom_forensics), "done garhering log: " + log + " in file: " + file.getAbsolutePath());
			}
			
			commander.writeBytes("exit\n"); // exit from super user process
			commander.flush();
			commander.close();
			p.waitFor();
			p.destroy();
			// inflate payload of POST request
			for (String log : logs ) {
				File file = new File(getExternalFilesDir(null), log_file_prefix + log);
				BufferedReader reader = new BufferedReader(new FileReader(file.getAbsolutePath()));
				StringBuilder log_buffer = new StringBuilder();
				String line = null;
				while((line = reader.readLine()) != null) {
					log_buffer.append(line);
					log_buffer.append('\n');
				}
				payload.add(new BasicNameValuePair(log, log_buffer.toString()));
				reader.close();
			}
			// get packages list content and add it to payload
			Log.d(getString(R.string.imcom_forensics), "gathering packages info from: " + "/data/system/packages.list");
			File file = new File("/data/system/packages.list"); //TODO compatibility is unknown
			BufferedReader reader = new BufferedReader(new FileReader(file));
			StringBuilder packages_buffer = new StringBuilder();
			String line = null;
			while((line = reader.readLine()) != null) {
				packages_buffer.append(line);
				packages_buffer.append('\n');
			}
			payload.add(new BasicNameValuePair("packages", packages_buffer.toString()));
			reader.close();
			
			Log.d(getString(R.string.imcom_forensics), "Started uploading logs");
			bearer.setEntity(new UrlEncodedFormEntity(payload));
			HttpResponse res = uploader.execute(bearer);
			int status = res.getStatusLine().getStatusCode();
			if (status == HttpStatus.SC_OK) {
				Log.d(getString(R.string.imcom_forensics), "uploading succeeded");
			} else {
				Log.d(getString(R.string.imcom_forensics), "uploading failed");
			}

			bearer.abort(); // release the previous connection
		} catch (IOException e1) { //TODO upload error log to server
			e1.printStackTrace();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public int onStartCommand(Intent intent, int flags, int startId) {
		Log.d(getString(R.string.imcom_forensics), "Upload manager received start ID:" + startId);
		startUpload();
		return START_STICKY; // running until explicit termination
	}
	
	@Override
	public IBinder onBind(Intent intent) {
		// TODO Auto-generated method stub
		return null;
	}

}
