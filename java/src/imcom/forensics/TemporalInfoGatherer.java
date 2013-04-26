package imcom.forensics;

import java.io.BufferedWriter;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.TimeZone;

import android.util.Log;

public class TemporalInfoGatherer {
	
	private static final String LOG_TAG = "IMCOM-TemporalInfo";
	private static final int MILLIS_TO_HOURS = 60 * 60 * 1000;
	private String SYSTEM_INFO_FILENAME;
	private static final String CONFIG_SEPARATOR = ":";
	private static final String GATHERER_NAME = "TemporalInfo";
	
	public TemporalInfoGatherer(String info_filename) {
		this.SYSTEM_INFO_FILENAME = info_filename;
		Log.d(LOG_TAG, GATHERER_NAME + " launches");
	}
	
	public void gather(File dst_dir) throws IOException {
		long btime = 0;
		int uptime = 0;
		try {
			Process process_stat = Runtime.getRuntime().exec("cat /proc/stat");
			DataInputStream dis_stat = new DataInputStream(process_stat.getInputStream());
			process_stat.waitFor();
			String line = null;
			do {
				line = dis_stat.readLine();
				if (line.startsWith("btime")) {
					btime = Long.parseLong(line.split(" ")[1]);
					break;
				}
			} while(line != null);
			dis_stat.close();
			Process process_uptime = Runtime.getRuntime().exec("cat /proc/uptime");
			DataInputStream dis_uptime = new DataInputStream(process_uptime.getInputStream());
			process_uptime.waitFor();
			line = dis_uptime.readLine();
			String uptime_buf = line.split(" ")[0];
			uptime = Integer.parseInt(uptime_buf.substring(0, uptime_buf.lastIndexOf(".")));
			dis_uptime.close();
		} catch (IOException ex) {
			// TODO Auto-generated catch block
			ex.printStackTrace();
		} catch (InterruptedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		/* time zone offset */
		BufferedWriter sys_info_writer = new BufferedWriter(
				new FileWriter(
						new File(dst_dir, SYSTEM_INFO_FILENAME)
						)
				);
		
		sys_info_writer.write("timezone" + CONFIG_SEPARATOR 
				+ EscapeWrapper.nomarlize(TimeZone.getDefault().getDisplayName())
				);
		sys_info_writer.write(" ");
		sys_info_writer.write("tz_offset" + CONFIG_SEPARATOR +
				(TimeZone.getDefault().getOffset(System.currentTimeMillis()) / MILLIS_TO_HOURS)
				);
		sys_info_writer.write(" ");
		sys_info_writer.write("btime" + CONFIG_SEPARATOR + btime);
		sys_info_writer.write(" ");
		sys_info_writer.write("uptime" + CONFIG_SEPARATOR + uptime);
		sys_info_writer.newLine();
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering timezone settings");
		
		/* System environment 
		sys_info_writer.write("[System environment]");
		sys_info_writer.newLine();
		Map<String, String> env_attrs = System.getenv();
		Set<String> attr_names = env_attrs.keySet();
		for (String attr_name : attr_names) {
			sys_info_writer.write(
					attr_name + 
					CONFIG_SEPARATOR + 
					EscapeWrapper.replaceNewLine(
						env_attrs.get(attr_name),
						null
					)
				);
			sys_info_writer.newLine();
		}
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering environment variables");
		*/
		
		/* System properties 
		sys_info_writer.write("[System properties]");
		sys_info_writer.newLine();
		Properties sys_properties = System.getProperties();
		Enumeration<?> property_names = sys_properties.propertyNames();	
		while (property_names.hasMoreElements()) {
			String property_name = (String) property_names.nextElement();
			sys_info_writer.write(
					property_name + 
					CONFIG_SEPARATOR + 
					EscapeWrapper.replaceNewLine(
						sys_properties.getProperty(property_name),
						null
					)
				);
			sys_info_writer.newLine();
		}
		Log.d(LOG_TAG, GATHERER_NAME + "'s done gathering system properties");
		*/
		if (sys_info_writer != null) sys_info_writer.close();
	}
}
