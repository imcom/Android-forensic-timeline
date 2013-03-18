package imcom.forensics.extractors;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

import imcom.forensics.FormatHelper;
import android.content.ContentResolver;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.content.pm.PermissionInfo;
import android.net.Uri;
import android.util.Log;

public class ApplicationsExtractor extends GenericExtractor {

	public ApplicationsExtractor(String extractor_name) {
		super(extractor_name);
		// TODO Auto-generated constructor stub
	}
	
	@Override
	public int extract(ContentResolver resolver, Context context, File dst_dir) {
		Log.d(LOG_TAG, extractor_name + " launches");
		int application_num = 0;
		
		BufferedWriter writer;
		try {
			writer = new BufferedWriter(
				new FileWriter(
						new File(dst_dir, this.getExtractorName() + ".pjson")
					)
				);
			
			PackageManager package_manager = context.getPackageManager();
			List<ApplicationInfo> applications = package_manager.getInstalledApplications(
				PackageManager.GET_UNINSTALLED_PACKAGES
			);
			
			application_num = applications.size();
			
			for (ApplicationInfo app : applications) {
				String package_name = app.packageName;

				PackageInfo app_info = package_manager.getPackageInfo(package_name, PackageManager.GET_PERMISSIONS);

				writer.write(helper.formatString("name", package_name));
				writer.write(" ");
				writer.write("first_install_date" + ":" + app_info.firstInstallTime);
				writer.write(" ");
				writer.write("last_update_date" + ":" + app_info.lastUpdateTime);
				writer.write(" ");
				writer.write(helper.formatString("class_name", app.className));
				writer.write(" ");
				writer.write(helper.formatString("data_dir", app.dataDir));
				writer.write(" ");
				writer.write(helper.formatString("source_dir", app.sourceDir));
				writer.write(" ");
				writer.write(helper.formatString("pub_source_dir", app.publicSourceDir));
				writer.write(" ");
				
				PermissionInfo[] permission_info = app_info.permissions;
				if (permission_info != null) {
					int permission_num = permission_info.length;
					StringBuilder permissions = new StringBuilder();
					for (int i = 0; i < permission_num; ++i) {
						PermissionInfo permissionInfo = permission_info[i];
						permissions.append(permissionInfo.name);
						if (i < permission_num - 1) permissions.append(";");
					}
					writer.write(helper.formatString("permissions", permissions.toString()));
					writer.write(" ");
				} else {
					writer.write("permissions" + ":" + "null");
					writer.write(" ");
				}
				
				String[] requested_permissions = app_info.requestedPermissions;
				if (requested_permissions != null) {
					StringBuilder permissions = new StringBuilder();
					for (String requested_permission : requested_permissions) {
						permissions.append(requested_permission);
						permissions.append(";");
					}
					permissions.deleteCharAt(permissions.lastIndexOf(";"));
					writer.write(helper.formatString("requested_permissions", permissions.toString()));
					writer.newLine();
				} else {
					writer.write("requested_permissions" + ":" + "null");
					writer.newLine();
				}
			}
			
			if (writer != null) writer.close();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (NameNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return application_num;
		
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
