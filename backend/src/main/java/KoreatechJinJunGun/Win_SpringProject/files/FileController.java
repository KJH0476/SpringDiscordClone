package KoreatechJinJunGun.Win_SpringProject.files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload/{chatRoomId}")
    public ResponseEntity<String> uploadFile(@PathVariable String chatRoomId, @RequestParam("file") MultipartFile file) throws IOException {
        String fileId = fileService.storeFile(file, chatRoomId);
        return ResponseEntity.ok(fileId);
    }

    @GetMapping("/download/{chatRoomId}/{fileId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String chatRoomId, @PathVariable String fileId
    ) throws IOException {
        Resource resource = fileService.downloadFile(fileId, chatRoomId);
        if(resource == null) {
            return ResponseEntity.notFound().build();
        }

        String filename = fileService.getFileNameById(fileId);
        MediaType mediaTypeType = fileService.getContentTypeById(fileId);
        return ResponseEntity.ok()
                .contentType(mediaTypeType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }
}
