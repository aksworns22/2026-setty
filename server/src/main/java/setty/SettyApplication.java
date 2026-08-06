package setty;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import setty.common.operator.OperatorAuthProperties;
import setty.common.s3.S3Properties;
import setty.dispatch.DispatchProperties;

@SpringBootApplication
@EnableConfigurationProperties({S3Properties.class, OperatorAuthProperties.class, DispatchProperties.class})
public class SettyApplication {
    public static void main(String[] args) {
        SpringApplication.run(SettyApplication.class, args);
    }
}
