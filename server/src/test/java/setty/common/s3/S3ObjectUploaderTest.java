package setty.common.s3;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@ExtendWith(MockitoExtension.class)
class S3ObjectUploaderTest {
    @Mock
    private S3Client s3Client;

    @Captor
    private ArgumentCaptor<PutObjectRequest> requestCaptor;

    @TempDir
    private Path temporaryDirectory;

    @Test
    void uploadsSourceFileToConfiguredBucketWithGivenKey() throws IOException {
        final S3Properties s3Properties = new S3Properties("ap-northeast-2", "techcourse-project-2026");
        final S3ObjectUploader uploader = new S3ObjectUploader(s3Client, s3Properties);
        final Path sourceFile = Files.createFile(temporaryDirectory.resolve("sample-image.jpg"));

        uploader.upload(sourceFile, "setty/images/items/sample-image.jpg");

        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        assertThat(requestCaptor.getValue().bucket()).isEqualTo("techcourse-project-2026");
        assertThat(requestCaptor.getValue().key()).isEqualTo("setty/images/items/sample-image.jpg");
    }
}
