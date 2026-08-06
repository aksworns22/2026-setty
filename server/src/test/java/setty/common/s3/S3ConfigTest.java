package setty.common.s3;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@SpringBootTest
class S3ConfigTest {
    @Autowired
    private S3Client s3Client;

    @Autowired
    private S3Properties s3Properties;

    @Test
    void s3ClientIsConfiguredWithTheConfiguredRegion() {
        assertThat(s3Client.serviceClientConfiguration().region()).isEqualTo(Region.AP_NORTHEAST_2);
        assertThat(s3Properties.bucketName()).isEqualTo("techcourse-project-2026");
    }
}
