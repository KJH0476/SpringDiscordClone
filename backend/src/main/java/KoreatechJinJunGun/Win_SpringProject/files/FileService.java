package KoreatechJinJunGun.Win_SpringProject.files;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class FileService {

    @Autowired
    private GridFsTemplate gridFsTemplate;

    public String storeFile(MultipartFile file, String chatRoomId) throws IOException {
        // 파일 메타데이터 생성
        DBObject metaData = new BasicDBObject();
        metaData.put("chatRoomId", chatRoomId); // chatRoomId를 메타데이터에 추가

        // 파일을 GridFS에 저장하고 생성된 ID 반환
        Object fileId = gridFsTemplate.store(file.getInputStream(), file.getOriginalFilename(), file.getContentType(), metaData);
        return fileId.toString();
    }

    public Resource downloadFile(String fileId, String chatRoomId) throws IOException {
        GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(fileId)));
        if (gridFSFile == null) {
            return null;
        }
        return new ByteArrayResource(gridFsTemplate.getResource(gridFSFile).getInputStream().readAllBytes());
    }

    public String getFileNameById(String objectId) {
        // Object ID로 파일 조회
        GridFSFile gridFSFile = gridFsTemplate.findOne(Query.query(Criteria.where("_id").is(objectId)));
        if (gridFSFile != null) {
            // 파일 이름 반환
            return gridFSFile.getFilename();
        }
        return null; // 파일이 존재하지 않는 경우
    }

    public MediaType getContentTypeById(String fileId) {
        GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new ObjectId(fileId))));
        if (gridFSFile != null && gridFSFile.getMetadata() != null) {
            Document metadata = gridFSFile.getMetadata();
            String contentType = metadata.getString("_contentType");
            return MediaType.parseMediaType(contentType);
        }
        return MediaType.APPLICATION_OCTET_STREAM; // 기본 값
    }
}

